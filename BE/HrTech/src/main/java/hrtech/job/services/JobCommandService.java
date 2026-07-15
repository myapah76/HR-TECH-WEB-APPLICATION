package hrtech.job.services;

import hrtech.company.entities.Company;
import hrtech.identity.entities.User;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.abstractions.repositories.JobSkillRepository;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobSkill;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.mapper.JobMapper;
import hrtech.job.validators.JobValidator;
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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class JobCommandService {

    private final ICreditService creditService;

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;

    private final JobMapper jobMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final JobValidator jobValidator;

    public JobResponse createJob(JobRequest request) {
        User currentUser = jobValidator.getCurrentUser();
        Company company = jobValidator.validateCompanyApproved(request.companyId());
        jobValidator.validateCanPostJob(currentUser, company.getId());

        creditService.deductCompanyFeatureQuota(currentUser.getId(), "JOB_POSTING", 1);

        Job job = Job.builder()
                .company(company)
                .createdBy(currentUser)
                .status(JobStatus.DRAFT)
                .jobSkills(new ArrayList<>())
                .build();
        jobMapper.applyJobFields(job, request);

        Job savedJob = jobRepository.save(job);

        log.info("Recruiter {} created job '{}' for company {}", currentUser.getId(), savedJob.getTitle(),
                company.getId());
        return jobMapper.toResponse(savedJob);
    }

    public JobResponse updateOwnJob(UUID jobId, JobRequest request) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanSubmitJob(currentUser, job);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be edited. Current status: " + job.getStatus());
        }

        jobMapper.applyJobFields(job, request);

        job.getJobSkills().clear();
        List<JobSkill> newSkills = jobMapper.buildJobSkills(job, request.skills());
        job.getJobSkills().addAll(newSkills);

        job.setExtractionStatus(ExtractionStatus.PENDING);
        Job updatedJob = jobRepository.save(job);

        log.info("Recruiter {} updated job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(updatedJob);
    }

    public JobResponse submitJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanEditJob(currentUser, job);

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be submitted. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.PENDING_APPROVAL);
        Job savedJob = jobRepository.save(job);
        log.info("Recruiter {} submitted job {} for approval", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    public JobResponse approveJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanApproveJob(currentUser, job.getCompany().getId());

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be approved. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.APPROVED);
        Job savedJob = jobRepository.save(job);

        final UUID finalApproveJobId = savedJob.getId();
        eventPublisher.publishEvent(new JobExtractionRequestedEvent(finalApproveJobId));

        log.info("Approver {} approved job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    public JobResponse rejectJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanApproveJob(currentUser, job.getCompany().getId());

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be rejected. Current status: " + job.getStatus());
        }

        job.setStatus(JobStatus.REJECTED);
        Job savedJob = jobRepository.save(job);
        log.info("Approver {} rejected job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    public JobResponse closeJob(UUID jobId) {
        User currentUser = jobValidator.getCurrentUser();
        Job job = jobValidator.getActiveJob(jobId);

        jobValidator.validateCompanyApproved(job.getCompany().getId());
        jobValidator.validateCanCloseJob(currentUser, job);

        if (job.getStatus() == JobStatus.CLOSED) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Job is already CLOSED.");
        }

        job.setStatus(JobStatus.CLOSED);
        Job savedJob = jobRepository.save(job);
        log.info("User {} closed job {}", currentUser.getId(), jobId);
        return jobMapper.toResponse(savedJob);
    }

    public void adminDeleteJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));
        job.setDeleted(true);
        jobRepository.save(job);
        log.warn("Admin soft-deleted job {}", jobId);
    }

    public void saveJobEntity(Job job) {
        jobRepository.save(job);
    }

    public void saveJobSkill(JobSkill jobSkill) {
        jobSkillRepository.save(jobSkill);
    }
}
