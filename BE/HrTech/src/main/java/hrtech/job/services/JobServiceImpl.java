package hrtech.job.services;

import com.querydsl.core.BooleanBuilder;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.company.abstractions.services.ICompanyMemberService;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.company.entities.Company;
import hrtech.company.entities.CompanyMember;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.job.abstractions.repositories.JobAuditLogRepository;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.abstractions.repositories.JobSkillRepository;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobAuditLog;
import hrtech.job.entities.JobSkill;
import hrtech.job.entities.QJob;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobAuditAction;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.entities.enums.NotificationType;
import hrtech.job.mapper.JobMapper;
import hrtech.job.projections.PositionJobCountProjection;
import hrtech.job.projections.SkillJobCountProjection;
import hrtech.shared.enums.ExtractionStatus;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.events.JobExtractionRequestedEvent;
import hrtech.shared.exceptions.AppException;
import hrtech.skill.abstractions.services.ISkillService;
import hrtech.skill.dtos.response.SkillResponse;
import hrtech.job.dtos.request.ReviewJobPostingRequest;
import hrtech.job.dtos.response.ReviewJobPostingResponse;
import hrtech.subscription.abstractions.services.ICreditService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.concurrent.CompletableFuture;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class JobServiceImpl implements IJobService {

    private final ICreditService creditService;
    private final ICompanyService companyService;
    private final ISkillService skillService;
    private final JobAiServiceClient jobAiServiceClient;
    private final INotificationService notificationService;

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final JobAuditLogRepository jobAuditLogRepository;
    private final PlatformTransactionManager transactionManager;

    private final JobMapper jobMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final AuthUtils authUtils;
    private final ObjectMapper objectMapper;

    @Autowired
    @Lazy
    private IApplicationService applicationService;

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private void logStatusChange(Job job, JobStatus fromStatus, JobStatus toStatus, JobAuditAction action, User actor,
            String reason) {
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

    private void runAiCheck(UUID jobId, UUID triggerUserId) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    triggerAsyncAiCheck(jobId, triggerUserId);
                }
            });
        } else {
            triggerAsyncAiCheck(jobId, triggerUserId);
        }
    }

    private void triggerAsyncAiCheck(UUID jobId, UUID triggerUserId) {
        CompletableFuture.runAsync(() -> {
            try {
                new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                    Job job = jobRepository.findById(jobId).orElse(null);
                    if (job == null) return;

                    JobStatus previousStatus = job.getStatus();

                    ReviewJobPostingRequest reviewRequest = ReviewJobPostingRequest.builder()
                            .title(job.getTitle())
                            .description(job.getDescription())
                            .requirements(job.getRequirements())
                            .benefits(job.getBenefits())
                            .location(job.getLocation())
                            .salary_min(job.getSalaryMin() != null ? job.getSalaryMin().doubleValue() : null)
                            .salary_max(job.getSalaryMax() != null ? job.getSalaryMax().doubleValue() : null)
                            .job_type(job.getJobType() != null ? job.getJobType().name() : "")
                            .experience_level(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : "")
                            .position(job.getPosition())
                            .build();

                    ReviewJobPostingResponse reviewResponse = null;
                    int maxAttempts = 3; // Retry up to 3 times total
                    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                        reviewResponse = jobAiServiceClient.reviewJobPosting(reviewRequest);
                        if (reviewResponse != null) {
                            break;
                        }
                        if (attempt < maxAttempts) {
                            try {
                                Thread.sleep(10000);
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                break;
                            }
                        }
                    }

                    if (reviewResponse == null) {
                        job.setStatus(JobStatus.FAILED_AI);
                        jobRepository.save(job);

                        String errorMessage = "Hệ thống kiểm duyệt AI tự động đang bận hoặc ngoại tuyến. Vui lòng tạo báo cáo/khiếu nại để gửi Admin xử lý và phê duyệt thủ công.";
                        logStatusChange(job, previousStatus, JobStatus.FAILED_AI, JobAuditAction.AI_OFFLINE_FAIL, null,
                                errorMessage);

                        // Notify recipients
                        try {
                            List<UUID> recipientIds = new ArrayList<>();
                            recipientIds.add(job.getCreatedBy().getId());
                            if (triggerUserId != null && !job.getCreatedBy().getId().equals(triggerUserId)) {
                                recipientIds.add(triggerUserId);
                            }
                            notificationService.createAndSendNotification(
                                    recipientIds,
                                    "Kiểm duyệt AI thất bại",
                                    "Tin tuyển dụng '" + job.getTitle()
                                            + "' kiểm duyệt AI thất bại do hệ thống bận. Vui lòng gửi khiếu nại.",
                                    NotificationType.JOB_STATUS_UPDATED,
                                    job.getId().toString());
                        } catch (Exception e) {
                            log.error("Failed to send AI offline notification for job " + job.getId(), e);
                        }
                        return;
                    }

                    if (!reviewResponse.isApproved()) {
                        job.setStatus(JobStatus.FAILED_AI);
                        jobRepository.save(job);

                        String reason;
                        try {
                            Map<String, Object> errorDetails = new LinkedHashMap<>();
                            errorDetails.put("message", reviewResponse.getOverall_message());
                            errorDetails.put("reasons", reviewResponse.getRejection_reasons() != null ? reviewResponse.getRejection_reasons() : Collections.emptyList());
                            errorDetails.put("suggestions", reviewResponse.getSuggestions() != null ? reviewResponse.getSuggestions() : Collections.emptyList());
                            reason = objectMapper.writeValueAsString(errorDetails);
                        } catch (Exception e) {
                            log.error("Failed to serialize AI check rejection reasons to JSON", e);
                            reason = reviewResponse.getOverall_message();
                            if (reviewResponse.getRejection_reasons() != null && !reviewResponse.getRejection_reasons().isEmpty()) {
                                reason += " Lý do: " + String.join(", ", reviewResponse.getRejection_reasons());
                            }
                        }

                        logStatusChange(job, previousStatus, JobStatus.FAILED_AI, JobAuditAction.AI_REJECT, null, reason);

                        // Notify recipients
                        try {
                            List<UUID> recipientIds = new ArrayList<>();
                            recipientIds.add(job.getCreatedBy().getId());
                            if (triggerUserId != null && !job.getCreatedBy().getId().equals(triggerUserId)) {
                                recipientIds.add(triggerUserId);
                            }
                            notificationService.createAndSendNotification(
                                    recipientIds,
                                    "Tin tuyển dụng bị AI từ chối",
                                    "Tin tuyển dụng '" + job.getTitle() + "' không vượt qua kiểm duyệt AI.",
                                    NotificationType.JOB_STATUS_UPDATED,
                                    job.getId().toString());
                        } catch (Exception e) {
                            log.error("Failed to send AI reject notification for job " + job.getId(), e);
                        }
                    } else {
                        creditService.deductCompanyFeatureQuota(job.getCreatedBy().getId(), "JOB_POSTING", 1);
                        job.setStatus(JobStatus.APPROVED);
                        Job savedJob = jobRepository.save(job);

                        String notes = "AI kiểm duyệt thành công. Không phát hiện vi phạm.";
                        if (reviewResponse.getOverall_message() != null) {
                            notes = reviewResponse.getOverall_message();
                        }

                        logStatusChange(savedJob, previousStatus, JobStatus.APPROVED, JobAuditAction.AI_PASS, null, notes);
                        eventPublisher.publishEvent(new JobExtractionRequestedEvent(savedJob.getId()));
                        log.info("AI check PASSED for job {}", job.getId());

                        // Notify recipients
                        try {
                            List<UUID> recipientIds = new ArrayList<>();
                            recipientIds.add(job.getCreatedBy().getId());
                            if (triggerUserId != null && !job.getCreatedBy().getId().equals(triggerUserId)) {
                                recipientIds.add(triggerUserId);
                            }
                            notificationService.createAndSendNotification(
                                    recipientIds,
                                    "Tin tuyển dụng đã được duyệt",
                                    "Tin tuyển dụng '" + job.getTitle() + "' đã vượt qua kiểm duyệt AI và hiển thị chính thức.",
                                    NotificationType.JOB_STATUS_UPDATED,
                                    job.getId().toString());
                        } catch (Exception e) {
                            log.error("Failed to send AI pass notification for job " + job.getId(), e);
                        }
                    }
                });
            } catch (Exception e) {
                log.error("Failed to run async AI check for job " + jobId, e);
            }
        });
    }

    private BooleanBuilder buildKeywordPredicate(String trimmedKeyword, QJob qJob) {
        BooleanBuilder keywordBuilder = new BooleanBuilder();
        String trimmedLower = trimmedKeyword.toLowerCase();
        String normalizedRole = skillService.resolveCanonicalRole(trimmedLower);
        Set<String> skillIds = new HashSet<>();
        List<String> idsByRole = skillService.getSkillIdsByRole(normalizedRole);
        if (idsByRole != null)
            skillIds.addAll(idsByRole);
        List<String> idsByName = skillService.getSkillIdsByNameContaining(trimmedLower);
        if (idsByName != null)
            skillIds.addAll(idsByName);

        keywordBuilder.or(qJob.title.toLowerCase().contains(trimmedLower))
                .or(qJob.description.toLowerCase().contains(trimmedLower))
                .or(qJob.company.name.toLowerCase().contains(trimmedLower))
                .or(qJob.position.toLowerCase().contains(trimmedLower));

        if (!skillIds.isEmpty()) {
            keywordBuilder.or(qJob.jobSkills.any().skillNeo4jId.in(skillIds));
        }
        return keywordBuilder;
    }

    // ─── Command ─────────────────────────────────────────────────────────────────

    @Override
    public JobResponse createJob(JobRequest request) {
        User currentUser = authUtils.getCurrentUser();
        CompanyMember member = companyService.getMemberEntityByUserId(currentUser.getId());
        Company company = member.getCompany();

        Job job = jobMapper.toEntity(request);
        job.setCompany(company);
        job.setCreatedBy(currentUser);

        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, null, JobStatus.DRAFT, JobAuditAction.CREATE, currentUser,
                "Tạo tin tuyển dụng bản nháp.");
        return jobMapper.toResponse(savedJob);
    }

    @Override
    public JobResponse updateJob(UUID jobId, JobRequest request) {
        Job job = getJobEntityById(jobId);

        JobStatus previousStatus = job.getStatus();
        if (previousStatus != JobStatus.DRAFT
                && previousStatus != JobStatus.REJECTED
                && previousStatus != JobStatus.FAILED_AI
                && previousStatus != JobStatus.REJECTED_BY_ADMIN) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT, REJECTED, FAILED_AI, or REJECTED_BY_ADMIN jobs can be edited. Current status: "
                            + previousStatus);
        }

        jobMapper.updateJobFromRequest(request, job);
        job.getJobSkills().clear();
        List<JobSkill> newSkills = jobMapper.buildJobSkills(job, request.skills());
        job.getJobSkills().addAll(newSkills);
        job.setExtractionStatus(ExtractionStatus.PENDING);
        job.setStatus(JobStatus.DRAFT);
        Job updatedJob = jobRepository.save(job);

        User currentUser = authUtils.getCurrentUser();
        logStatusChange(updatedJob, previousStatus, JobStatus.DRAFT, JobAuditAction.EDIT, currentUser,
                "Chỉnh sửa nội dung, đưa về trạng thái nháp.");

        if (previousStatus == JobStatus.REJECTED
                || previousStatus == JobStatus.FAILED_AI
                || previousStatus == JobStatus.REJECTED_BY_ADMIN) {
            CompanyRole role = companyService
                    .getMemberByCompanyIdAndUserId(job.getCompany().getId(), currentUser.getId())
                    .map(CompanyMember::getCompanyRole)
                    .orElse(CompanyRole.HR);

            if (role == CompanyRole.HR_MANAGER || role == CompanyRole.OWNER) {
                // Set status to PENDING_APPROVAL so manager can directly approve the updated
                // job via approveJob
                updatedJob.setStatus(JobStatus.PENDING_APPROVAL);
                jobRepository.save(updatedJob);
                return approveJob(jobId);
            } else {
                return submitJob(jobId);
            }
        }

        return jobMapper.toResponse(updatedJob);
    }

    @Override
    public JobResponse submitJob(UUID jobId) {
        Job job = getJobEntityById(jobId);
        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be submitted. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.PENDING_APPROVAL);
        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, previousStatus, JobStatus.PENDING_APPROVAL, JobAuditAction.SUBMIT,
                authUtils.getCurrentUser(), "Gửi duyệt tin tuyển dụng.");
        return jobMapper.toResponse(savedJob);
    }

    @Override
    public JobResponse approveJob(UUID jobId) {
        Job job = getJobEntityById(jobId);
        User currentUser = authUtils.getCurrentUser();

        // Direct approve if manager created draft
        boolean isOwnerOrManager = companyService
                .getMemberByCompanyIdAndUserId(job.getCompany().getId(), currentUser.getId())
                .map(m -> m.getCompanyRole() == CompanyRole.OWNER || m.getCompanyRole() == CompanyRole.HR_MANAGER)
                .orElse(false);
        boolean isManagerCreatedDraft = job.getStatus() == JobStatus.DRAFT
                && job.getCreatedBy().getId().equals(currentUser.getId())
                && isOwnerOrManager;

        if (isManagerCreatedDraft) {
            JobStatus previousStatus = job.getStatus();
            job.setStatus(JobStatus.PENDING_AI);
            Job savedJob = jobRepository.save(job);

            logStatusChange(
                    savedJob,
                    previousStatus,
                    JobStatus.PENDING_AI,
                    JobAuditAction.MANAGER_DIRECT_APPROVE,
                    currentUser,
                    "HR Manager tự duyệt tin tuyển dụng do chính mình tạo. Chuyển tiếp quét AI tự động.");

            runAiCheck(savedJob.getId(), currentUser.getId());
            return toResponseWithReason(savedJob);
        }

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be approved. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.PENDING_AI);
        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, previousStatus, JobStatus.PENDING_AI, JobAuditAction.MANAGER_APPROVE, currentUser,
                "HR Manager phê duyệt tin tuyển dụng. Chuyển tiếp quét AI tự động.");

        runAiCheck(savedJob.getId(), currentUser.getId());
        return toResponseWithReason(savedJob);
    }

    @Override
    public JobResponse rejectJob(UUID jobId, String reason) {
        Job job = getJobEntityById(jobId);
        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be rejected. Current status: " + job.getStatus());
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Reject reason is required.");
        }

        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.REJECTED);
        Job savedJob = jobRepository.save(job);
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(savedJob, previousStatus, JobStatus.REJECTED, JobAuditAction.MANAGER_REJECT, currentUser,
                reason.trim());

        try {
            notificationService.createAndSendNotification(
                    savedJob.getCreatedBy().getId(),
                    "Tin tuyển dụng bị từ chối",
                    "Tin tuyển dụng '" + savedJob.getTitle() + "' đã bị từ chối bởi Manager.",
                    NotificationType.JOB_STATUS_UPDATED,
                    savedJob.getId().toString());
        } catch (Exception e) {
            log.error("Failed to send manager reject notification for job " + savedJob.getId(), e);
        }

        return toResponseWithReason(savedJob);
    }

    @Override
    public JobResponse closeJob(UUID jobId) {
        Job job = getJobEntityById(jobId);
        if (job.getStatus() == JobStatus.CLOSED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Job is already CLOSED.");
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.CLOSED);
        Job savedJob = jobRepository.save(job);
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(savedJob, previousStatus, JobStatus.CLOSED, JobAuditAction.CLOSE, currentUser,
                "Đóng tin tuyển dụng.");
        return toResponseWithReason(savedJob);
    }

    @Override
    public void deleteJob(UUID jobId) {
        Job job = getJobEntityById(jobId);
        UUID currentUserId = authUtils.getCurrentUserId();
        // Chỉ xóa tin DRAFT
        if (job.getStatus() != JobStatus.DRAFT) {
            throw new AppException(
                    ErrorCode.JOB_INVALID_STATUS,
                    "Only DRAFT jobs can be deleted. Current status: " + job.getStatus());
        }
        // Chỉ xóa tin do chính người dùng tạo
        if (!job.getCreatedBy().getId().equals(currentUserId)) {
            throw new AppException(
                    ErrorCode.JOB_PERMISSION_DENIED,
                    "You can only delete jobs that you created.");
        }
        jobRepository.delete(job);
    }

    @Override
    public JobResponse appealJob(UUID jobId) {
        Job job = getJobEntityById(jobId);
        if (job.getStatus() != JobStatus.FAILED_AI) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only FAILED_AI jobs can be appealed. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.APPEALED);
        Job savedJob = jobRepository.save(job);
        User currentUser = authUtils.getCurrentUser();
        logStatusChange(savedJob, previousStatus, JobStatus.APPEALED, JobAuditAction.SUBMIT_APPEAL, currentUser,
                "Gửi khiếu nại lên Admin Hệ thống.");
        return toResponseWithReason(savedJob);
    }

    @Override
    public JobResponse approveAppeal(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = getJobEntityById(jobId);
        // Chỉ cho phép phê duyệt khiếu nại nếu trạng thái hiện tại là APPEALED
        if (job.getStatus() != JobStatus.APPEALED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only APPEALED jobs can be resolved. Current status: " + job.getStatus());
        }
        // Chuyển trạng thái sang APPROVED và lưu lại
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.APPROVED);
        Job savedJob = jobRepository.save(job);
        // Ghi log hành động phê duyệt khiếu nại
        logStatusChange(savedJob, previousStatus, JobStatus.APPROVED, JobAuditAction.ADMIN_APPROVE_APPEAL, currentUser,
                "Admin phê duyệt khiếu nại. Tin tuyển dụng chính thức hiển thị.");
        // Trừ 1 credit JOB_POSTING của công ty
        creditService.deductCompanyFeatureQuota(job.getCreatedBy().getId(), "JOB_POSTING", 1);
        eventPublisher.publishEvent(new JobExtractionRequestedEvent(savedJob.getId()));
        // Gửi thông báo cho người dùng đã gửi khiếu nại (nếu có) hoặc người tạo tin tuyển dụng
        UUID targetUserId = job.getCreatedBy().getId();
        Optional<JobAuditLog> appealLog = jobAuditLogRepository
                .findFirstByJobIdAndActionOrderByCreatedAtDesc(jobId, JobAuditAction.SUBMIT_APPEAL);
        if (appealLog.isPresent() && appealLog.get().getActor() != null) {
            targetUserId = appealLog.get().getActor().getId();
        }
        try {
            notificationService.createAndSendNotification(
                    targetUserId,
                    "Khiếu nại tin tuyển dụng được chấp thuận",
                    "Khiếu nại của bạn cho tin tuyển dụng '" + savedJob.getTitle() + "' đã được Admin chấp thuận.",
                    NotificationType.JOB_STATUS_UPDATED,
                    savedJob.getId().toString());
        } catch (Exception e) {
            log.error("Failed to send admin reject appeal notification for job " + savedJob.getId(), e);
        }

        return toResponseWithReason(savedJob);
    }

    @Override
    public JobResponse rejectAppeal(UUID jobId, String reason) {
        User currentUser = authUtils.getCurrentUser();
        Job job = getJobEntityById(jobId);
        if (job.getStatus() != JobStatus.APPEALED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only APPEALED jobs can be resolved. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.REJECTED_BY_ADMIN);
        Job savedJob = jobRepository.save(job);
        
        String notes = (reason != null && !reason.trim().isEmpty()) ? reason 
                : "Admin bác bỏ khiếu nại. Tin tuyển dụng được trả về để chỉnh sửa.";
        
        logStatusChange(savedJob, previousStatus, JobStatus.REJECTED_BY_ADMIN, JobAuditAction.ADMIN_REJECT_APPEAL,
                currentUser, notes);

        UUID targetUserId = job.getCreatedBy().getId();
        Optional<JobAuditLog> appealLog = jobAuditLogRepository
                .findFirstByJobIdAndActionOrderByCreatedAtDesc(jobId, JobAuditAction.SUBMIT_APPEAL);
        if (appealLog.isPresent() && appealLog.get().getActor() != null) {
            targetUserId = appealLog.get().getActor().getId();
        }

        try {
            notificationService.createAndSendNotification(
                    targetUserId,
                    "Khiếu nại tin tuyển dụng bị từ chối",
                    "Khiếu nại của bạn cho tin tuyển dụng '" + savedJob.getTitle() + "' đã bị Admin bác bỏ.",
                    NotificationType.JOB_STATUS_UPDATED,
                    savedJob.getId().toString());
        } catch (Exception e) {
            log.error("Failed to send admin reject appeal notification for job " + savedJob.getId(), e);
        }

        return toResponseWithReason(savedJob);
    }

    @Override
    public void saveJobEntity(Job job) {
        jobRepository.save(job);
    }

    @Override
    public void saveJobSkill(JobSkill jobSkill) {
        jobSkillRepository.save(jobSkill);
    }

    // ─── Query ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobDetails(UUID jobId) {
        return toResponseWithReason(getJobEntityById(jobId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(JobSearchCriteria criteria, Pageable pageable) {
        QJob qJob = QJob.job;
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(qJob.deleted.isFalse());
        builder.and(qJob.status.eq(JobStatus.APPROVED));

        if (criteria.keyword() != null && !criteria.keyword().trim().isEmpty()) {
            builder.and(buildKeywordPredicate(criteria.keyword().trim(), qJob));
        }
        if (criteria.location() != null && !criteria.location().isEmpty()) {
            builder.and(qJob.location.containsIgnoreCase(criteria.location().trim()));
        }
        if (criteria.jobType() != null) {
            builder.and(qJob.jobType.eq(criteria.jobType()));
        }
        if (criteria.experienceLevel() != null) {
            builder.and(qJob.experienceLevel.eq(criteria.experienceLevel()));
        }
        if (criteria.salaryMin() != null) {
            builder.and(qJob.salaryMax.goe(criteria.salaryMin()));
        }
        if (criteria.salaryMax() != null) {
            builder.and(qJob.salaryMin.loe(criteria.salaryMax()));
        }
        if (criteria.skills() != null && !criteria.skills().isEmpty()) {
            for (String skillName : criteria.skills()) {
                skillService.getSkillByName(skillName)
                        .map(skillNode -> skillNode.getId())
                        .ifPresent(skillId -> builder.and(qJob.jobSkills.any().skillNeo4jId.eq(skillId)));
            }
        }
        Page<Job> jobPage = jobRepository.findAll(builder, pageable);
        jobMapper.preloadSkillNames(jobPage.getContent());
        return jobPage.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> listJobs(Pageable pageable) {
        Page<Job> page = jobRepository.findByStatus(JobStatus.APPROVED, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobReport(String keyword, Pageable pageable) {
        String keywordParam = (keyword != null && !keyword.trim().isEmpty())
                ? "%" + keyword.trim().toLowerCase() + "%"
                : null;
        Page<Job> page = jobRepository.findAllJobsForAdmin(keywordParam, JobStatus.APPEALED, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getPublicCompanyJobs(UUID companyId, Pageable pageable) {
        Page<Job> page = jobRepository.findCompanyJobsWithFilters(companyId, JobStatus.APPROVED, null, null, null,
                pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getManageCompanyJobs(
            UUID companyId, String keyword, JobStatus status, JobType jobType, ExperienceLevel jobLevel, Pageable pageable) {
        User currentUser = authUtils.getCurrentUser();
        CompanyMember member = companyService.getMemberByCompanyIdAndUserId(companyId, currentUser.getId())
                .orElseThrow(
                        () -> new AppException(ErrorCode.JOB_PERMISSION_DENIED, "You do not belong to this company."));

        QJob qJob = QJob.job;
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(qJob.deleted.isFalse());
        builder.and(qJob.company.id.eq(companyId));

        if (keyword != null && !keyword.trim().isEmpty()) {
            String cleanKeyword = keyword.trim().toLowerCase();
            builder.and(qJob.title.toLowerCase().contains(cleanKeyword)
                    .or(qJob.position.toLowerCase().contains(cleanKeyword))
                    .or(qJob.location.toLowerCase().contains(cleanKeyword)));
        }

        if (status != null) {
            builder.and(qJob.status.eq(status));
        }
        if (jobType != null) {
            builder.and(qJob.jobType.eq(jobType));
        }
        if (jobLevel != null) {
            builder.and(qJob.experienceLevel.eq(jobLevel));
        }

        if (member.getCompanyRole() == CompanyRole.HR) {
            builder.and(qJob.createdBy.id.eq(currentUser.getId())
                    .or(qJob.status.eq(JobStatus.APPROVED))
                    .or(qJob.status.eq(JobStatus.CLOSED)));
        } else {
            builder.and(qJob.status.ne(JobStatus.DRAFT).or(qJob.createdBy.id.eq(currentUser.getId())));
        }

        Page<Job> page = jobRepository.findAll(builder, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Job getJobEntityById(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Job> findStuckJobs(List<ExtractionStatus> statuses, Instant threshold) {
        return jobRepository.findStuckJobs(statuses, threshold);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Job> getAllJobEntities() {
        return jobRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Job> getJobsByCompanyId(UUID companyId) {
        return jobRepository.findByCompanyIdAndDeletedFalse(companyId);
    }

    // ─── Analytics ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<TrendingSkillResponse> getTrendingSkills(int limit) {
        var rawTrending = jobSkillRepository.findTrendingSkills(JobStatus.APPROVED, PageRequest.of(0, limit));
        if (rawTrending.isEmpty())
            return Collections.emptyList();

        List<String> ids = rawTrending.stream().map(SkillJobCountProjection::getSkillNeo4jId).toList();
        List<SkillResponse> skillNodes = skillService.getSkillsByIds(ids);

        return rawTrending.stream().map(p -> {
            String name = skillNodes.stream()
                    .filter(node -> node.getId().equals(p.getSkillNeo4jId()))
                    .map(SkillResponse::getName)
                    .findFirst()
                    .orElse(p.getSkillNeo4jId());
            if (name != null && !name.isEmpty()) {
                name = name.substring(0, 1).toUpperCase() + name.substring(1);
            }
            return new TrendingSkillResponse(name, p.getJobCount());
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotPositionResponse> getHotPositions(int limit) {
        List<PositionJobCountProjection> results = jobRepository.findHotPositionsByStatus(
                JobStatus.APPROVED, PageRequest.of(0, limit));
        return results.stream()
                .filter(p -> p.getName() != null)
                .map(p -> new HotPositionResponse(p.getName(), p.getJobCount()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LandingStatsResponse getLandingStats() {
        long totalJobs = jobRepository.countByStatus(JobStatus.APPROVED);
        long totalCompanies = companyService.countApprovedCompanies();
        long totalApplications = applicationService.countApplicationsByStatus(ApplicationStatus.INTERVIEW);
        return new LandingStatsResponse(totalJobs, totalCompanies, totalApplications);
    }

    private JobResponse toResponseWithReason(Job job) {
        JobResponse response = jobMapper.toResponse(job);
        return new JobResponse(
                response.id(),
                response.companyId(),
                response.companyName(),
                response.companyLogoUrl(),
                response.createdById(),
                response.createdByName(),
                response.title(),
                response.position(),
                response.description(),
                response.location(),
                response.salaryMin(),
                response.salaryMax(),
                response.jobType(),
                response.experienceLevel(),
                response.status(),
                response.deadline(),
                response.requirements(),
                response.benefits(),
                response.extractionStatus(),
                response.skills(),
                resolveRejectionReason(job),
                response.createdAt(),
                response.updatedAt());
    }

    private String resolveRejectionReason(Job job) {
        if (job.getStatus() == JobStatus.REJECTED
                || job.getStatus() == JobStatus.REJECTED_BY_ADMIN
                || job.getStatus() == JobStatus.FAILED_AI) {
            return jobAuditLogRepository
                    .findFirstByJobIdAndToStatusOrderByCreatedAtDesc(job.getId(), job.getStatus().name())
                    .map(auditLog -> auditLog.getReasonOrNotes())
                    .orElse(null);
        } else if (job.getStatus() == JobStatus.APPEALED) {
            return jobAuditLogRepository
                    .findFirstByJobIdAndToStatusOrderByCreatedAtDesc(job.getId(), JobStatus.FAILED_AI.name())
                    .map(auditLog -> auditLog.getReasonOrNotes())
                    .orElse(null);
        }
        return null;
    }
}
