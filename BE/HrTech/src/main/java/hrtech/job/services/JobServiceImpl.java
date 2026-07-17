package hrtech.job.services;

import com.querydsl.core.BooleanBuilder;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.entities.enums.ApplicationStatus;
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
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final JobAuditLogRepository jobAuditLogRepository;

    private final JobMapper jobMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final AuthUtils authUtils;
    private final JobAiServiceClient jobAiServiceClient;

    @Autowired
    @Lazy
    private IApplicationService applicationService;

    // ─── Private Helpers ─────────────────────────────────────────────────────────

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

    private void runAiCheck(Job job) {
        JobStatus previousStatus = job.getStatus();

        ReviewJobPostingRequest reviewRequest = ReviewJobPostingRequest.builder()
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
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
                log.warn("AI Service call failed (attempt {}/{}). Retrying in 10 seconds...", attempt, maxAttempts);
                try {
                    Thread.sleep(10000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        if (reviewResponse == null) {
            log.error("AI Service is completely offline or timed out after {} attempts.", maxAttempts);
            job.setStatus(JobStatus.FAILED_AI);
            jobRepository.save(job);
            
            String errorMessage = "Hệ thống kiểm duyệt AI tự động đang bận hoặc ngoại tuyến. Vui lòng tạo báo cáo/khiếu nại để gửi Admin xử lý và phê duyệt thủ công.";
            logStatusChange(job, previousStatus, JobStatus.FAILED_AI, "AI_OFFLINE_FAIL", null, errorMessage);
            return;
        }

        if (!reviewResponse.isApproved()) {
            job.setStatus(JobStatus.FAILED_AI);
            jobRepository.save(job);

            String reason = reviewResponse.getOverall_message();
            if (reviewResponse.getRejection_reasons() != null && !reviewResponse.getRejection_reasons().isEmpty()) {
                reason += " Lý do: " + String.join(", ", reviewResponse.getRejection_reasons());
            }

            logStatusChange(job, previousStatus, JobStatus.FAILED_AI, "AI_REJECT", null, reason);
            log.warn("AI check FAILED for job {}: {}", job.getId(), reason);
        } else {
            creditService.deductCompanyFeatureQuota(job.getCreatedBy().getId(), "JOB_POSTING", 1);
            job.setStatus(JobStatus.APPROVED);
            Job savedJob = jobRepository.save(job);

            String notes = "AI kiểm duyệt thành công. Không phát hiện vi phạm.";
            if (reviewResponse.getOverall_message() != null) {
                notes = reviewResponse.getOverall_message();
            }

            logStatusChange(savedJob, previousStatus, JobStatus.APPROVED, "AI_PASS", null, notes);
            eventPublisher.publishEvent(new JobExtractionRequestedEvent(savedJob.getId()));
            log.info("AI check PASSED for job {}", job.getId());
        }
    }

    private BooleanBuilder buildKeywordPredicate(String trimmedKeyword, QJob qJob) {
        BooleanBuilder keywordBuilder = new BooleanBuilder();
        String trimmedLower = trimmedKeyword.toLowerCase();
        String normalizedRole = skillService.resolveCanonicalRole(trimmedLower);
        Set<String> skillIds = new HashSet<>();
        List<String> idsByRole = skillService.getSkillIdsByRole(normalizedRole);
        if (idsByRole != null) skillIds.addAll(idsByRole);
        List<String> idsByName = skillService.getSkillIdsByNameContaining(trimmedLower);
        if (idsByName != null) skillIds.addAll(idsByName);

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
        Company company = companyService.getCompanyEntityById(request.companyId());

        Job job = jobMapper.toEntity(request);
        job.setCompany(company);
        job.setCreatedBy(currentUser);

        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, null, JobStatus.DRAFT, "CREATE", currentUser, "Tạo tin tuyển dụng bản nháp.");
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
                    "Only DRAFT, REJECTED, FAILED_AI, or REJECTED_BY_ADMIN jobs can be edited. Current status: " + previousStatus);
        }

        jobMapper.updateJobFromRequest(request, job);
        job.getJobSkills().clear();
        List<JobSkill> newSkills = jobMapper.buildJobSkills(job, request.skills());
        job.getJobSkills().addAll(newSkills);
        job.setExtractionStatus(ExtractionStatus.PENDING);
        job.setStatus(JobStatus.DRAFT);
        Job updatedJob = jobRepository.save(job);

        User currentUser = authUtils.getCurrentUser();
        logStatusChange(updatedJob, previousStatus, JobStatus.DRAFT, "EDIT", currentUser, "Chỉnh sửa nội dung, đưa về trạng thái nháp.");
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
        logStatusChange(savedJob, previousStatus, JobStatus.PENDING_APPROVAL, "SUBMIT", authUtils.getCurrentUser(), "Gửi duyệt tin tuyển dụng.");
        return jobMapper.toResponse(savedJob);
    }

    @Override
    public JobResponse approveJob(UUID jobId) {
        Job job = getJobEntityById(jobId);
        User currentUser = authUtils.getCurrentUser();

        // Direct approve if manager created draft
        boolean isOwnerOrManager = companyService.getMemberByCompanyIdAndUserId(job.getCompany().getId(), currentUser.getId())
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
                "MANAGER_DIRECT_APPROVE",
                currentUser,
                "HR Manager tự duyệt tin tuyển dụng do chính mình tạo. Chuyển tiếp quét AI tự động."
            );

            runAiCheck(savedJob);
            return toResponseWithReason(savedJob);
        }

        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only PENDING_APPROVAL jobs can be approved. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.PENDING_AI);
        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, previousStatus, JobStatus.PENDING_AI, "MANAGER_APPROVE", currentUser,
                "HR Manager phê duyệt tin tuyển dụng. Chuyển tiếp quét AI tự động.");
        runAiCheck(savedJob);
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
        logStatusChange(savedJob, previousStatus, JobStatus.REJECTED, "MANAGER_REJECT", currentUser, reason.trim());
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
        logStatusChange(savedJob, previousStatus, JobStatus.CLOSED, "CLOSE", currentUser, "Đóng tin tuyển dụng.");
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
        logStatusChange(savedJob, previousStatus, JobStatus.APPEALED, "SUBMIT_APPEAL", currentUser, "Gửi khiếu nại lên Admin Hệ thống.");
        return toResponseWithReason(savedJob);
    }

    @Override
    public JobResponse approveAppeal(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = getJobEntityById(jobId);
        if (job.getStatus() != JobStatus.APPEALED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only APPEALED jobs can be resolved. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.APPROVED);
        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, previousStatus, JobStatus.APPROVED, "ADMIN_APPROVE_APPEAL", currentUser,
                "Admin phê duyệt khiếu nại. Tin tuyển dụng chính thức hiển thị.");
        creditService.deductCompanyFeatureQuota(job.getCreatedBy().getId(), "JOB_POSTING", 1);
        eventPublisher.publishEvent(new JobExtractionRequestedEvent(savedJob.getId()));
        return toResponseWithReason(savedJob);
    }

    @Override
    public JobResponse rejectAppeal(UUID jobId) {
        User currentUser = authUtils.getCurrentUser();
        Job job = getJobEntityById(jobId);
        if (job.getStatus() != JobStatus.APPEALED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS,
                    "Only APPEALED jobs can be resolved. Current status: " + job.getStatus());
        }
        JobStatus previousStatus = job.getStatus();
        job.setStatus(JobStatus.REJECTED_BY_ADMIN);
        Job savedJob = jobRepository.save(job);
        logStatusChange(savedJob, previousStatus, JobStatus.REJECTED_BY_ADMIN, "ADMIN_REJECT_APPEAL", currentUser,
                "Admin bác bỏ khiếu nại. Tin tuyển dụng được trả về để chỉnh sửa.");
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
                ? "%" + keyword.trim().toLowerCase() + "%" : null;
        Page<Job> page = jobRepository.findAllJobsForAdmin(keywordParam, JobStatus.APPEALED, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getPublicCompanyJobs(UUID companyId, Pageable pageable) {
        Page<Job> page = jobRepository.findCompanyJobsWithFilters(companyId, JobStatus.APPROVED, null, null, null, pageable);
        jobMapper.preloadSkillNames(page.getContent());
        return page.map(this::toResponseWithReason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getManageCompanyJobs(
            UUID companyId, JobStatus status, JobType jobType, ExperienceLevel jobLevel, Pageable pageable) {
        User currentUser = authUtils.getCurrentUser();
        UUID createdById = null;
        CompanyMember member = companyService.getMemberByCompanyIdAndUserId(companyId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.JOB_PERMISSION_DENIED, "You do not belong to this company."));
        if (member.getCompanyRole() == CompanyRole.HR) {
            createdById = currentUser.getId();
        }
        Page<Job> page = jobRepository.findCompanyJobsWithFilters(companyId, status, jobType, jobLevel, createdById, pageable);
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
        if (rawTrending.isEmpty()) return Collections.emptyList();

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
                response.extractionStatus(),
                response.skills(),
                resolveRejectionReason(job),
                response.createdAt(),
                response.updatedAt()
        );
    }

    private String resolveRejectionReason(Job job) {
        if (job.getStatus() == JobStatus.REJECTED) {
            return jobAuditLogRepository
                    .findFirstByJobIdAndActionOrderByCreatedAtDesc(job.getId(), "MANAGER_REJECT")
                    .map(auditLog -> auditLog.getReasonOrNotes())
                    .orElse(null);
        }

        if (job.getStatus() == JobStatus.REJECTED_BY_ADMIN) {
            return jobAuditLogRepository
                    .findFirstByJobIdAndActionOrderByCreatedAtDesc(job.getId(), "ADMIN_REJECT_APPEAL")
                    .map(auditLog -> auditLog.getReasonOrNotes())
                    .orElse(null);
        }

        return null;
    }
}
