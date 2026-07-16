package hrtech.job.services;

import hrtech.company.entities.Company;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.abstractions.repositories.JobSkillRepository;
import hrtech.job.abstractions.repositories.JobAuditLogRepository;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobSkill;
import hrtech.job.entities.JobAuditLog;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.mapper.JobMapper;
import hrtech.shared.enums.ExtractionStatus;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.events.JobExtractionRequestedEvent;
import hrtech.shared.exceptions.AppException;
import hrtech.subscription.abstractions.services.ICreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class JobCommandService {

    private final ICreditService creditService;
    private final ICompanyService companyService;
    private final JobQueryService jobQueryService;

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final JobAuditLogRepository jobAuditLogRepository;

    private final JobMapper jobMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final AuthUtils authUtils;


    private void logStatusChange(Job job, JobStatus fromStatus, JobStatus toStatus, String action, User actor, String reason) {
        JobAuditLog auditLog = JobAuditLog.builder()
                .jobId(job.getId())
                .fromStatus(fromStatus != null ? fromStatus.name() : null)
                .toStatus(toStatus.name())
                .action(action)
                .actor(actor)
                .reasonOrNotes(reason)
                .build();
        jobAuditLogRepository.save(auditLog);
    }

    private void runMockAiCheck(Job job) {
        // Mock AI scanner check: fail if title, description, or requirements contain forbidden keywords
        String title = job.getTitle() != null ? job.getTitle() : "";
        String desc = job.getDescription() != null ? job.getDescription() : "";
        String req = job.getRequirements() != null ? job.getRequirements() : "";
        String contentToScan = (title + " " + desc + " " + req).toLowerCase();

        JobStatus previousStatus = job.getStatus();

        if (contentToScan.contains("lừa đảo") || contentToScan.contains("đa cấp") || contentToScan.contains("cờ bạc")) {
            job.setStatus(JobStatus.FAILED_AI);
            jobRepository.save(job);
            logStatusChange(job, previousStatus, JobStatus.FAILED_AI, "AI_REJECT", null,
                    "AI phát hiện vi phạm: Tin tuyển dụng chứa từ khóa bị cấm (lừa đảo/đa cấp/cờ bạc).");
            log.warn("Mock AI check FAILED for job {}: contains illegal keywords", job.getId());
        } else {
            // Deduct company quota when approved
            creditService.deductCompanyFeatureQuota(job.getCreatedBy().getId(), "JOB_POSTING", 1);

            job.setStatus(JobStatus.APPROVED);
            Job savedJob = jobRepository.save(job);
            logStatusChange(savedJob, previousStatus, JobStatus.APPROVED, "AI_PASS", null,
                    "AI kiểm duyệt thành công. Không phát hiện vi phạm.");
            
            // Trigger skill extraction for approved jobs
            eventPublisher.publishEvent(new JobExtractionRequestedEvent(savedJob.getId()));
            log.info("Mock AI check PASSED for job {}", job.getId());
        }
    }

    public JobResponse createJob(JobRequest request) {
        User currentUser = authUtils.getCurrentUser();
        Company company = companyService.getCompanyEntityById(request.companyId());

        Job job = jobMapper.toEntity(request);
        job.setCompany(company);
        job.setCreatedBy(currentUser);

        Job savedJob = jobRepository.save(job);

        // Log creation
        logStatusChange(savedJob, null, JobStatus.DRAFT, "CREATE", currentUser, "Tạo tin tuyển dụng bản nháp.");

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse updateJob(UUID jobId, JobRequest request) {
        Job job = jobQueryService.getJobEntityById(jobId);

        // Allow editing if the job is DRAFT, REJECTED, FAILED_AI, or REJECTED_BY_ADMIN
        JobStatus previousStatus = job.getStatus();
        if (previousStatus != JobStatus.DRAFT && 
            previousStatus != JobStatus.REJECTED && 
            previousStatus != JobStatus.FAILED_AI && 
            previousStatus != JobStatus.REJECTED_BY_ADMIN) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT, REJECTED, FAILED_AI, or REJECTED_BY_ADMIN jobs can be edited. Current status: " + previousStatus);
        }

        jobMapper.updateJobFromRequest(request, job);

        job.getJobSkills().clear();
        List<JobSkill> newSkills = jobMapper.buildJobSkills(job, request.skills());
        job.getJobSkills().addAll(newSkills);

        job.setExtractionStatus(ExtractionStatus.PENDING);
        
        // Reset status back to DRAFT when edited
        job.setStatus(JobStatus.DRAFT);
        Job updatedJob = jobRepository.save(job);

        // Log edit
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(
                updatedJob,
                previousStatus,
                JobStatus.DRAFT,
                "EDIT", currentUser,
                "Chỉnh sửa nội dung, đưa về trạng thái nháp."
        );

        return jobMapper.toResponse(updatedJob);
    }

    public JobResponse submitJob(UUID jobId) {
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be submitted. Current status: " + job.getStatus());
        }

        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.PENDING_APPROVAL);
        Job savedJob = jobRepository.save(job);
        
        // Log submission
        logStatusChange(
                savedJob,
                previousStatus,
                JobStatus.PENDING_APPROVAL,
                "SUBMIT", authUtils.getCurrentUser(),
                "Gửi duyệt tin tuyển dụng."
        );

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse approveJob(UUID jobId) {
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be approved. Current status: " + job.getStatus());
        }

        JobStatus previousStatus = job.getStatus();
        
        // Step 1: Transition to PENDING_AI
        job.setStatus(JobStatus.PENDING_AI);
        Job savedJob = jobRepository.save(job);
        
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(savedJob, previousStatus, JobStatus.PENDING_AI, "MANAGER_APPROVE", currentUser, 
                "HR Manager phê duyệt tin tuyển dụng. Chuyển tiếp quét AI tự động.");

        // Step 2: Run mock AI check
        runMockAiCheck(savedJob);

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse rejectJob(UUID jobId) {
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be rejected. Current status: " + job.getStatus());
        }

        JobStatus previousStatus = job.getStatus();
        
        // Set to REJECTED so that HR can see it was rejected by manager, and then edit it
        job.setStatus(JobStatus.REJECTED);
        Job savedJob = jobRepository.save(job);
        
        // Log manager reject
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(savedJob, previousStatus, JobStatus.REJECTED, "MANAGER_REJECT", currentUser, "HR Manager từ chối tin tuyển dụng.");

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse closeJob(UUID jobId) {
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Job is already CLOSED.");
        }

        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.CLOSED);
        Job savedJob = jobRepository.save(job);
        
        // Log closure
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(savedJob, previousStatus, JobStatus.CLOSED, "CLOSE", currentUser, "Đóng tin tuyển dụng.");

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse appealJob(UUID jobId) {
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() != JobStatus.FAILED_AI) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only FAILED_AI jobs can be appealed. Current status: " + job.getStatus());
        }

        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.APPEALED);
        Job savedJob = jobRepository.save(job);

        // Log appeal
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(
                savedJob,
                previousStatus,
                JobStatus.APPEALED,
                "SUBMIT_APPEAL",
                currentUser,
                "Gửi khiếu nại lên Admin Hệ thống."
        );

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse approveAppeal(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() != JobStatus.APPEALED) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only APPEALED jobs can be resolved. Current status: " + job.getStatus());
        }

        JobStatus previousStatus = job.getStatus();

        job.setStatus(JobStatus.APPROVED);
        Job savedJob = jobRepository.save(job);

        // Log admin approve appeal
        logStatusChange(
                savedJob,
                previousStatus,
                JobStatus.APPROVED,
                "ADMIN_APPROVE_APPEAL",
                currentUser,
                "Admin phê duyệt khiếu nại. Tin tuyển dụng chính thức hiển thị."
        );

        // Deduct company quota when approved via appeal
        creditService.deductCompanyFeatureQuota(job.getCreatedBy().getId(), "JOB_POSTING", 1);

        // Trigger skill extraction
        eventPublisher.publishEvent(new JobExtractionRequestedEvent(savedJob.getId()));

        return jobMapper.toResponse(savedJob);
    }

    public JobResponse rejectAppeal(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = jobQueryService.getJobEntityById(jobId);

        if (job.getStatus() != JobStatus.APPEALED) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only APPEALED jobs can be resolved. Current status: " + job.getStatus());
        }

        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.REJECTED_BY_ADMIN);
        Job savedJob = jobRepository.save(job);

        // Log admin reject appeal
        logStatusChange(savedJob, previousStatus, JobStatus.REJECTED_BY_ADMIN, "ADMIN_REJECT_APPEAL", currentUser, "Admin bác bỏ khiếu nại. Tin tuyển dụng được trả về để chỉnh sửa.");

        return jobMapper.toResponse(savedJob);
    }


    public void saveJobEntity(Job job) {
        jobRepository.save(job);
    }

    public void saveJobSkill(JobSkill jobSkill) {
        jobSkillRepository.save(jobSkill);
    }
}
