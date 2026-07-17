package hrtech.application.services;

import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.application.abstractions.repositories.ApplicationScoreRepository;
import hrtech.application.abstractions.repositories.SkillMatchRepository;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.dtos.request.ChangeInterviewScheduleRequest;
import hrtech.application.dtos.request.ScheduleInterviewRequest;
import hrtech.application.dtos.request.SubmitApplicationRequest;
import hrtech.application.dtos.request.UpdateApplicationStatusRequest;
import hrtech.application.dtos.response.ApplicationDetailResponse;
import hrtech.application.dtos.response.ApplicationSummaryResponse;
import hrtech.application.dtos.response.ApplicationDashboardSummaryResponse;
import hrtech.application.dtos.response.RecentActivityResponse;
import hrtech.application.dtos.response.UpcomingInterviewResponse;
import hrtech.application.dtos.response.JobSearchAnalyticsResponse;
import hrtech.application.entities.Application;
import hrtech.application.entities.ApplicationScore;
import hrtech.application.entities.SkillMatch;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.application.entities.enums.MatchStatus;
import hrtech.application.entities.enums.MatchType;
import hrtech.application.mapper.ApplicationMapper;
import hrtech.company.entities.Company;
import hrtech.company.entities.CompanyMember;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.entities.User;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.JobStatus;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.dtos.request.ApplicationStatusNotificationRequest;
import hrtech.notification.entities.enums.NotificationType;
import hrtech.shared.enums.ScoreGrade;
import hrtech.shared.enums.SkillLevel;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.subscription.abstractions.services.ICreditService;
import hrtech.skill.abstractions.services.IRecommendationService;
import hrtech.skill.dtos.response.SkillMatchDetail;
import hrtech.skill.dtos.response.SkillMatchScoreResponse;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.identity.utils.AuthUtils;
import hrtech.company.dtos.response.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import java.util.Comparator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationServiceImpl implements IApplicationService {

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final IJobService jobService;
    private final ICvService cvService;
    private final IUserService userService;
    private final INotificationService notificationService;
    private final ICreditService creditService;
    private final IRecommendationService recommendationService;
    private final ICompanyService companyService;
    private final ApplicationRepository applicationRepository;
    private final ApplicationScoreRepository applicationScoreRepository;
    private final SkillMatchRepository skillMatchRepository;
    private final ApplicationMapper applicationMapper;
    private final AuthUtils authUtils;

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    // ─── COMMAND METHODS ───────────────────────────────────────────────────────

    @Override
    public ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request) {
        User user = userService.getUserEntityById(userId);
        Job job = jobService.getJobEntityById(request.getJobId());

        if (job.getStatus() != JobStatus.APPROVED) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Job is not APPROVED for applications");
        }

        Cv cv = cvService.getCvEntityById(request.getCvId());

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED, "CV does not belong to user");
        }

        if (applicationRepository.existsByUserIdAndJobIdAndStatusNotIn(
                userId,
                job.getId(),
                List.of(ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN))) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Already applied to this job");
        }

        // Create application
        Application application = Application.builder()
                .user(user)
                .job(job)
                .cv(cv)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.SUBMITTED)
                .appliedAt(Instant.now())
                .build();

        application = applicationRepository.save(application);

        // Send notification to recruiter (the creator of the job)
        if (job.getCreatedBy() != null) {
            try {
                String candidateName = user.getFirstName() + " " + user.getLastName();
                String title = "Hồ sơ ứng tuyển mới";
                String content = candidateName + " đã ứng tuyển vào vị trí " + job.getTitle();
                notificationService.createAndSendNotification(
                        job.getCreatedBy().getId(),
                        title,
                        content,
                        NotificationType.APPLICATION_STATUS_UPDATED,
                        application.getId().toString()
                );
            } catch (Exception e) {
                log.error("Failed to send notification to recruiter for new application", e);
            }
        }

        log.info("User {} applied for job {}", userId, job.getId());
        return applicationMapper.toSummaryResponse(application);
    }

    @Override
    public void withdrawApplication(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED, "Application does not belong to user");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    @Override
    public ApplicationSummaryResponse updateStatus(UUID applicationId, UpdateApplicationStatusRequest request) {
        if (request == null || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Application status is required");
        }

        ApplicationStatus newStatus = request.getStatus();
        if (newStatus == ApplicationStatus.ACCEPTED) {
            if (request.getAcceptedStartDateTime() == null) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Accepted start date/time is required");
            }
            if (normalizeBlank(request.getAcceptedWorkAddress()) == null) {
                throw new AppException(ErrorCode.INVALID_INPUT, "Accepted work address is required");
            }
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        application.setStatus(newStatus);
        application = applicationRepository.save(application);

        notifyCandidateAfterStatusCommit(application, request);

        return applicationMapper.toSummaryResponse(application);
    }

    @Override
    public ApplicationSummaryResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        application.setStatus(ApplicationStatus.PENDING_INTERVIEW_SCHEDULE);
        application.setInterviewDateTime(request.interviewDateTime());
        application.setInterviewLocation(normalizeBlank(request.interviewLocation()));
        application.setInterviewMeetingLink(normalizeBlank(request.interviewMeetingLink()));
        application.setInterviewNote(normalizeBlank(request.note()));
        application.setInterviewAcceptedAt(null);
        application.setCandidateInterviewResponseMessage(null);
        application.setCandidatePreferredInterviewDateTime(null);

        application = applicationRepository.save(application);

        notifyInterviewScheduleAfterCommit(application);

        return applicationMapper.toSummaryResponse(application);
    }

    @Override
    public ApplicationSummaryResponse acceptInterviewSchedule(UUID userId, UUID applicationId) {
        Application application = findCandidateApplicationWaitingForSchedule(userId, applicationId);

        application.setStatus(ApplicationStatus.INTERVIEW);
        application.setInterviewAcceptedAt(Instant.now());
        application.setCandidateInterviewResponseMessage(null);
        application.setCandidatePreferredInterviewDateTime(null);

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    @Override
    public ApplicationSummaryResponse changeInterviewSchedule(UUID userId, UUID applicationId, ChangeInterviewScheduleRequest request) {
        Application application = findCandidateApplicationWaitingForSchedule(userId, applicationId);

        application.setStatus(ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE);
        application.setInterviewAcceptedAt(null);
        application.setCandidatePreferredInterviewDateTime(request.candidatePreferredInterviewDateTime());
        application.setCandidateInterviewResponseMessage(normalizeBlank(request.reason()));

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    @Override
    public ApplicationSummaryResponse acceptCandidateReschedule(UUID applicationId) {
        Application application = findApplicationWaitingForRescheduleReview(applicationId);

        application.setInterviewDateTime(application.getCandidatePreferredInterviewDateTime());
        application.setStatus(ApplicationStatus.INTERVIEW);
        application.setInterviewAcceptedAt(Instant.now());
        application.setCandidatePreferredInterviewDateTime(null);
        application.setCandidateInterviewResponseMessage(null);

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    @Override
    public ApplicationSummaryResponse rejectCandidateReschedule(UUID applicationId) {
        Application application = findApplicationWaitingForRescheduleReview(applicationId);

        application.setStatus(ApplicationStatus.PENDING_INTERVIEW_SCHEDULE);
        application.setInterviewAcceptedAt(null);
        application.setCandidatePreferredInterviewDateTime(null);
        application.setCandidateInterviewResponseMessage(null);

        return applicationMapper.toSummaryResponse(applicationRepository.save(application));
    }

    // ─── QUERY METHODS ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable) {
        return applicationRepository.findByUserId(userId, pageable)
                .map(applicationMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        boolean isApplicant = application.getUser().getId().equals(userId);
        boolean isCompanyMember = application.getJob() != null
                && application.getJob().getCompany() != null
                && companyService.getMemberByCompanyIdAndUserId(
                        application.getJob().getCompany().getId(), userId).isPresent();

        if (!isApplicant && !isCompanyMember) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to view this application");
        }

        return applicationMapper.toDetailResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable)
                .map(applicationMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasApplied(UUID userId, UUID jobId) {
        return applicationRepository.existsByUserIdAndJobIdAndStatusNotIn(
                userId,
                jobId,
                List.of(ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN));
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByUserId(UUID userId) {
        return applicationRepository.countByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByUserIdAndStatus(UUID userId, ApplicationStatus status) {
        return applicationRepository.countByUserIdAndStatus(userId, status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getRecentApplications(UUID userId, int limit) {
        return applicationRepository.findByUserIdOrderByAppliedAtDesc(userId, PageRequest.of(0, limit));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getUpcomingInterviews(UUID userId) {
        return applicationRepository.findByUserIdAndStatusAndInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(
                userId, ApplicationStatus.INTERVIEW, Instant.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getAllApplicationsByUserId(UUID userId) {
        return applicationRepository.findByUserId(userId);
    }

    // ─── SCORING METHOD ────────────────────────────────────────────────────────

    @Override
    public ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (application.getApplicationScore() != null) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Application has already been scored.");
        }

        boolean isProcessed = false;

        if (creditService.hasCandidateFeatureAccess(userId, "APP_SCORING")) {
            creditService.deductCandidateQuota(userId, "APP_SCORING", 1);
            isProcessed = true;
        }

        if (!isProcessed) {
            try {
                if (creditService.hasCompanyFeatureAccess(userId, "APP_SCORING")) {
                    creditService.deductCompanyFeatureQuota(userId, "APP_SCORING", 1);
                    isProcessed = true;
                }
            } catch (Exception e) {
                // Ignore if user is not a company member
            }
        }

        if (!isProcessed) {
            throw new AppException(ErrorCode.FORBIDDEN, "Gói của bạn không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
        }

        try {
            SkillMatchScoreResponse matchScore = recommendationService.calculateMatchScore(application.getCv().getId(), application.getJob().getId());
            ScoreGrade grade = matchScore.getGrade();

            ApplicationScore applicationScore = ApplicationScore.builder()
                    .application(application)
                    .overallScore(BigDecimal.valueOf(matchScore.getOverallScore()))
                    .grade(grade)
                    .aiSummary("AI Score calculated from graph and embeddings")
                    .aiSuggestion(generateSuggestion(grade))
                    .modelVersion("1.0")
                    .scoredAt(Instant.now())
                    .build();

            applicationScore = applicationScoreRepository.save(applicationScore);
            application.setApplicationScore(applicationScore);

            // Save SkillMatch entities
            for (SkillMatchDetail detail : matchScore.getSkillDetails()) {
                MatchStatus mStatus;
                try {
                    mStatus = MatchStatus.valueOf(detail.getMatchStatus());
                } catch (Exception e) {
                    mStatus = MatchStatus.MISSING;
                }

                MatchType mType;
                try {
                    mType = MatchType.valueOf(detail.getMatchType());
                } catch (Exception e) {
                    if (detail.getMatchType() != null && detail.getMatchType().contains("RELATED")) {
                        mType = MatchType.RELATED;
                    } else if (detail.getMatchType() != null && detail.getMatchType().contains("PARENT")) {
                        mType = MatchType.PARENT;
                    } else if ("EXACT".equals(detail.getMatchType())) {
                        mType = MatchType.DIRECT;
                    } else {
                        mType = null;
                    }
                }

                SkillLevel reqLevel = null;
                try {
                    if (detail.getRequiredLevel() != null) reqLevel = SkillLevel.valueOf(detail.getRequiredLevel());
                } catch (Exception ignored) {}

                SkillLevel candLevel = null;
                try {
                    if (detail.getCandidateLevel() != null) candLevel = SkillLevel.valueOf(detail.getCandidateLevel());
                } catch (Exception ignored) {}

                SkillMatch skillMatch = SkillMatch.builder()
                        .applicationScore(applicationScore)
                        .skillNeo4jId(detail.getSkillNeo4jId())
                        .requiredLevel(reqLevel)
                        .candidateLevel(candLevel)
                        .matchStatus(mStatus)
                        .matchType(mType)
                        .weight(BigDecimal.valueOf(1.0))
                        .isMandatory(false)
                        .build();
                skillMatchRepository.save(skillMatch);
            }

        } catch (Exception e) {
            log.error("Failed to calculate AI match score for application {}", application.getId(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Failed to score application: " + e.getMessage());
        }

        return applicationMapper.toDetailResponse(application);
    }

    // ─── DASHBOARD METHODS ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApplicationDashboardSummaryResponse getApplicationDashboardSummary(UUID userId) {
        long appliedCount = applicationRepository.countByUserId(userId);
        long interviewCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW);
        return ApplicationDashboardSummaryResponse.builder()
                .appliedCount(appliedCount)
                .interviewCount(interviewCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentActivityResponse> getRecentApplicationsForDashboard(UUID userId, int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();
        getRecentApplications(userId, limit).forEach(app -> {
            String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí tuyển dụng";
            activities.add(RecentActivityResponse.builder()
                    .action("Nộp hồ sơ ứng tuyển vị trí: " + jobTitle)
                    .date(app.getAppliedAt())
                    .status("submitted")
                    .build());
        });
        return activities;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UpcomingInterviewResponse> getUpcomingInterviewsForDashboard(UUID userId) {
        return getUpcomingInterviews(userId).stream()
                .map(this::toUpcomingInterviewResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobSearchAnalyticsResponse getJobSearchAnalytics(UUID userId) {
        List<Application> apps = applicationRepository.findByUserId(userId);
        long total = apps.size();

        long appliedCount = total;
        long acceptedCount = countByStatusExcluding(apps, ApplicationStatus.SUBMITTED, ApplicationStatus.WITHDRAWN,
                ApplicationStatus.REJECTED);
        long interviewingCount = countByStatusIn(apps,
                ApplicationStatus.PENDING_INTERVIEW_SCHEDULE,
                ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE,
                ApplicationStatus.INTERVIEW,
                ApplicationStatus.INTERVIEW_COMPLETED);
        long offerCount = countByStatusIn(apps, ApplicationStatus.ACCEPTED);

        return JobSearchAnalyticsResponse.builder()
                .funnelData(buildFunnelData(total, appliedCount, acceptedCount, interviewingCount, offerCount))
                .weeklyData(buildWeeklyData(apps))
                .monthlyData(buildMonthlyData(apps))
                .yearlyData(buildYearlyData(apps))
                .build();
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────────

    private void notifyCandidateAfterStatusCommit(Application application, UpdateApplicationStatusRequest request) {
        Job job = application.getJob();
        String jobTitle = job == null ? null : job.getTitle();
        String companyName = job == null || job.getCompany() == null ? null : job.getCompany().getName();

        ApplicationStatusNotificationRequest notificationRequest = new ApplicationStatusNotificationRequest(
                application.getUser().getEmail(),
                buildFullName(application.getUser()),
                jobTitle,
                companyName,
                request.getStatus().name(),
                application.getId().toString(),
                null,
                null,
                null,
                null,
                null,
                null,
                request.getAcceptedStartDateTime(),
                normalizeBlank(request.getAcceptedWorkAddress()),
                normalizeBlank(request.getAcceptedNote())
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notificationService.ApplicationStatusNotificationHandler(notificationRequest);
                }
            });
            return;
        }

        notificationService.ApplicationStatusNotificationHandler(notificationRequest);
    }

    private void notifyInterviewScheduleAfterCommit(Application application) {
        String actionLink = frontendBaseUrl + "/candidate/applied-jobs";

        ApplicationStatusNotificationRequest notificationRequest = new ApplicationStatusNotificationRequest(
                application.getUser().getEmail(),
                buildFullName(application.getUser()),
                application.getJob().getTitle(),
                application.getJob().getCompany() == null ? null : application.getJob().getCompany().getName(),
                ApplicationStatus.PENDING_INTERVIEW_SCHEDULE.name(),
                application.getId().toString(),
                application.getInterviewDateTime(),
                application.getInterviewLocation(),
                application.getInterviewMeetingLink(),
                application.getInterviewNote(),
                actionLink,
                "Phản hồi lịch phỏng vấn",
                null,
                null,
                null
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notificationService.ApplicationStatusNotificationHandler(notificationRequest);
                }
            });
            return;
        }

        notificationService.ApplicationStatusNotificationHandler(notificationRequest);
    }

    private Application findCandidateApplicationWaitingForSchedule(UUID userId, UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Application does not belong to current candidate");
        }

        if (application.getStatus() != ApplicationStatus.PENDING_INTERVIEW_SCHEDULE) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application is not waiting for interview schedule response");
        }

        if (application.getInterviewDateTime() == null) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application does not have an interview schedule");
        }

        return application;
    }

    private Application findApplicationWaitingForRescheduleReview(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));

        if (application.getStatus() != ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application is not waiting for reschedule review");
        }

        if (application.getCandidatePreferredInterviewDateTime() == null) {
            throw new AppException(ErrorCode.JOB_INVALID_STATUS, "Application does not have a candidate preferred interview time");
        }

        return application;
    }

    private String normalizeBlank(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String lastName = user.getLastName() == null ? "" : user.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();

        if (!fullName.isBlank()) {
            return fullName;
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return user.getEmail();
    }

    private String generateSuggestion(ScoreGrade grade) {
        return switch (grade) {
            case EXCELLENT -> "Ứng viên rất phù hợp với vị trí này.";
            case GOOD -> "Ứng viên khá phù hợp, cần kiểm tra thêm ở vòng phỏng vấn.";
            case FAIR -> "Ứng viên đạt yêu cầu cơ bản, nhưng thiếu một số kỹ năng quan trọng.";
            case POOR -> "Ứng viên chưa đáp ứng yêu cầu của vị trí này.";
        };
    }

    private UpcomingInterviewResponse toUpcomingInterviewResponse(Application app) {
        String companyName = (app.getJob() != null && app.getJob().getCompany() != null)
                ? app.getJob().getCompany().getName()
                : "Nhà tuyển dụng";
        String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí không xác định";
        return UpcomingInterviewResponse.builder()
                .company(companyName)
                .position(jobTitle)
                .dateTime(app.getInterviewDateTime())
                .meetUrl(app.getInterviewMeetingLink())
                .location(app.getInterviewLocation())
                .applicationId(app.getId())
                .build();
    }

    private long countByStatusExcluding(List<Application> apps, ApplicationStatus... excluded) {
        List<ApplicationStatus> excludedList = List.of(excluded);
        return apps.stream().filter(a -> !excludedList.contains(a.getStatus())).count();
    }

    private long countByStatusIn(List<Application> apps, ApplicationStatus... statuses) {
        List<ApplicationStatus> statusList = List.of(statuses);
        return apps.stream().filter(a -> statusList.contains(a.getStatus())).count();
    }

    private List<JobSearchAnalyticsResponse.FunnelStageDto> buildFunnelData(
            long total, long applied, long accepted, long interviewing, long offer) {
        return List.of(
                funnelStage("Đã nộp CV", applied, total),
                funnelStage("CV được chấp nhận", accepted, total),
                funnelStage("Đang phỏng vấn", interviewing, total),
                funnelStage("Nhận Offer thành công", offer, total));
    }

    private JobSearchAnalyticsResponse.FunnelStageDto funnelStage(String stage, long count, long total) {
        return JobSearchAnalyticsResponse.FunnelStageDto.builder()
                .stage(stage).count(count)
                .percent(total > 0 ? Math.round((count * 100.0) / total) : 0.0)
                .build();
    }

    private List<JobSearchAnalyticsResponse.ChartItemDto> buildWeeklyData(List<Application> apps) {
        LocalDate today = LocalDate.now(ZONE_VN);
        List<JobSearchAnalyticsResponse.ChartItemDto> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> a.getAppliedAt().atZone(ZONE_VN).toLocalDate().equals(d))
                    .count();
            result.add(new JobSearchAnalyticsResponse.ChartItemDto(
                    d.format(DateTimeFormatter.ofPattern("dd/MM")), count));
        }
        return result;
    }

    private List<JobSearchAnalyticsResponse.ChartItemDto> buildMonthlyData(List<Application> apps) {
        LocalDate today = LocalDate.now(ZONE_VN);
        List<JobSearchAnalyticsResponse.ChartItemDto> result = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusMonths(i);
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> {
                        ZonedDateTime zdt = a.getAppliedAt().atZone(ZONE_VN);
                        return zdt.getYear() == d.getYear() && zdt.getMonthValue() == d.getMonthValue();
                    })
                    .count();
            result.add(new JobSearchAnalyticsResponse.ChartItemDto(
                    "T" + d.getMonthValue() + "/" + String.format("%02d", d.getYear() % 100), count));
        }
        return result;
    }

    private List<JobSearchAnalyticsResponse.ChartItemDto> buildYearlyData(List<Application> apps) {
        LocalDate today = LocalDate.now(ZONE_VN);
        List<JobSearchAnalyticsResponse.ChartItemDto> result = new ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            int targetYear = today.getYear() - i;
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> a.getAppliedAt().atZone(ZONE_VN).getYear() == targetYear)
                    .count();
            result.add(new JobSearchAnalyticsResponse.ChartItemDto(String.valueOf(targetYear), count));
        }
        return result;
    }

    // ─── RECRUITER DASHBOARD METHODS ───────────────────────────────────────────

    private Company resolveRecruiterCompany() {
        User currentUser = authUtils.getCurrentUser();
        CompanyMember member = companyService.getMemberEntityByUserId(currentUser.getId());
        Company company = member.getCompany();
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_BANNED, "Company has been deactivated or banned.");
        }
        return company;
    }

    private List<Job> getCompanyJobs(UUID companyId) {
        return jobService.getJobsByCompanyId(companyId);
    }

    private List<Application> getCompanyApplications(List<Job> jobs) {
        List<UUID> jobIds = jobs.stream().map(Job::getId).toList();
        return jobIds.isEmpty() ? new ArrayList<>() : applicationRepository.findByJobIdIn(jobIds);
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterDashboardSummaryResponse getRecruiterDashboardSummary() {
        Company company = resolveRecruiterCompany();
        List<Job> jobs = getCompanyJobs(company.getId());
        List<Application> apps = getCompanyApplications(jobs);

        return RecruiterDashboardSummaryResponse.builder()
                .activeJobsCount(jobs.stream().filter(j -> j.getStatus() == JobStatus.APPROVED).count())
                .totalApps(apps.size())
                .submittedAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED).count())
                .screeningAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SCORED).count())
                .interviewAppsCount(apps.stream()
                        .filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW
                                || a.getStatus() == ApplicationStatus.PENDING_INTERVIEW_SCHEDULE)
                        .count())
                .offerAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED).count())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecruiterUpcomingInterviewResponse> getRecruiterUpcomingInterviews() {
        Company company = resolveRecruiterCompany();
        List<Job> jobs = getCompanyJobs(company.getId());
        List<Application> apps = getCompanyApplications(jobs);

        return apps.stream()
                .filter(a -> a.getInterviewDateTime() != null)
                .sorted(Comparator.comparing(Application::getInterviewDateTime))
                .limit(4)
                .map(a -> RecruiterUpcomingInterviewResponse.builder()
                        .cvTitle(a.getCv() != null ? a.getCv().getTitle() : "CV")
                        .jobTitle(a.getJob() != null ? a.getJob().getTitle() : "Vị trí tuyển dụng")
                        .interviewDateTime(a.getInterviewDateTime())
                        .status(a.getStatus().name())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterAnalyticsResponse getRecruiterAnalytics() {
        Company company = resolveRecruiterCompany();
        List<Job> jobs = getCompanyJobs(company.getId());
        List<Application> apps = getCompanyApplications(jobs);

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(zoneId);

        // ── 7 days ──────────────────────────────────────────────────────────────
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd/MM");
        List<RecruiterAnalyticsItem> sevenDays = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            ZonedDateTime day = now.minusDays(i);
            LocalDate targetDate = day.toLocalDate();
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> ZonedDateTime.ofInstant(a.getAppliedAt(), zoneId).toLocalDate().equals(targetDate))
                    .count();
            sevenDays.add(new RecruiterAnalyticsItem(day.format(dayFmt), count));
        }

        // ── 6 months ────────────────────────────────────────────────────────────
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MM/yyyy");
        List<RecruiterAnalyticsItem> sixMonths = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime month = now.minusMonths(i);
            int yr = month.getYear(), mo = month.getMonthValue();
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> {
                        ZonedDateTime d = ZonedDateTime.ofInstant(a.getAppliedAt(), zoneId);
                        return d.getYear() == yr && d.getMonthValue() == mo;
                    })
                    .count();
            sixMonths.add(new RecruiterAnalyticsItem("T" + month.format(monthFmt), count));
        }

        // ── 3 years ─────────────────────────────────────────────────────────────
        List<RecruiterAnalyticsItem> threeYears = new ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            int year = now.getYear() - i;
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> ZonedDateTime.ofInstant(a.getAppliedAt(), zoneId).getYear() == year)
                    .count();
            threeYears.add(new RecruiterAnalyticsItem(String.valueOf(year), count));
        }

        return RecruiterAnalyticsResponse.builder()
                .sevenDays(sevenDays)
                .sixMonths(sixMonths)
                .threeYears(threeYears)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecruiterActiveJobResponse> getRecruiterActiveJobs() {
        Company company = resolveRecruiterCompany();
        List<Job> jobs = getCompanyJobs(company.getId());
        List<Application> apps = getCompanyApplications(jobs);

        return jobs.stream()
                .filter(j -> j.getStatus() == JobStatus.APPROVED)
                .sorted(Comparator.comparing(Job::getCreatedAt).reversed())
                .limit(3)
                .map(j -> {
                    long appCount = apps.stream()
                            .filter(a -> a.getJob() != null && a.getJob().getId().equals(j.getId()))
                            .count();
                    return RecruiterActiveJobResponse.builder()
                            .id(j.getId())
                            .title(j.getTitle())
                            .location(j.getLocation())
                            .salaryMin(j.getSalaryMin())
                            .salaryMax(j.getSalaryMax())
                            .applicantCount(appCount)
                            .build();
                })
                .toList();
    }
}