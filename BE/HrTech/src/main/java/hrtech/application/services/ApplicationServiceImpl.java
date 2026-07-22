package hrtech.application.services;

import hrtech.application.abstractions.repositories.*;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.dtos.request.*;
import hrtech.application.dtos.response.*;
import hrtech.job.abstractions.repositories.JobInterviewRoundRepository;
import hrtech.shared.dtos.RecentActivityResponse;
import hrtech.application.entities.Application;
import hrtech.application.entities.ApplicationInterviewRound;
import hrtech.application.entities.InterviewSlot;
import hrtech.application.entities.ApplicationScore;
import hrtech.application.entities.SkillMatch;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.application.entities.enums.InterviewRoundStatus;
import hrtech.job.entities.JobInterviewRound;
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
import hrtech.job.abstractions.services.ISavedJobService;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.JobStatus;
import hrtech.notification.abstractions.services.INotificationService;
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

import java.time.*;
import java.util.Comparator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationServiceImpl implements IApplicationService {

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final IJobService jobService;
    private final ISavedJobService savedJobService;
    private final ICvService cvService;
    private final IUserService userService;
    private final INotificationService notificationService;
    private final ICreditService creditService;
    private final IRecommendationService recommendationService;
    private final ICompanyService companyService;

    private final ApplicationRepository applicationRepository;
    private final ApplicationScoreRepository applicationScoreRepository;
    private final SkillMatchRepository skillMatchRepository;
    private final ApplicationInterviewRoundRepository applicationInterviewRoundRepository;
    private final JobInterviewRoundRepository jobInterviewRoundRepository;
    private final InterviewSlotRepository interviewSlotRepository;

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
                        application.getId().toString());
            } catch (Exception e) {
                log.error("Failed to send notification to recruiter for new application", e);
            }
        }

        log.info("User {} applied for job {}", userId, job.getId());
        return applicationMapper.toSummaryResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Application getApplicationEntityById(UUID applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Application not found"));
    }

    @Override
    public void withdrawApplication(UUID userId, UUID applicationId) {
        Application application = getApplicationEntityById(applicationId);

        if (!application.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.JOB_PERMISSION_DENIED, "Application does not belong to user");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    @Override
    public ApplicationSummaryResponse acceptApplication(UUID applicationId) {
        Application application = getApplicationEntityById(applicationId);

        application.setStatus(ApplicationStatus.ACCEPTED);
        application = applicationRepository.save(application);

        notifyCandidateStatusAfterCommit(application, ApplicationStatus.ACCEPTED);

        return applicationMapper.toSummaryResponse(application);
    }

    @Override
    public ApplicationSummaryResponse rejectApplication(UUID applicationId) {
        Application application = getApplicationEntityById(applicationId);

        application.setStatus(ApplicationStatus.REJECTED);
        application = applicationRepository.save(application);

        notifyCandidateStatusAfterCommit(application, ApplicationStatus.REJECTED);

        return applicationMapper.toSummaryResponse(application);
    }

    private void notifyCandidateStatusAfterCommit(Application application, ApplicationStatus status) {
        String email = application.getUser().getEmail();
        String fullName = buildFullName(application.getUser());
        String jobTitle = application.getJob() != null ? application.getJob().getTitle() : null;
        String companyName = (application.getJob() != null && application.getJob().getCompany() != null)
                ? application.getJob().getCompany().getName()
                : null;
        String appIdStr = application.getId().toString();

        Runnable notificationTask;
        switch (status) {
            case ApplicationStatus.ACCEPTED -> notificationTask = () -> notificationService
                    .sendApplicationAcceptedNotification(email, fullName, jobTitle, companyName, appIdStr);
            case ApplicationStatus.REJECTED -> notificationTask = () -> notificationService
                    .sendApplicationRejectedNotification(email, fullName, jobTitle, companyName, appIdStr);
            default -> {
                return;
            }
        }

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notificationTask.run();
                }
            });
        } else {
            notificationTask.run();
        }
    }

    private String buildFullName(User user) {
        if (user == null)
            return null;
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

    // ─── QUERY METHODS ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable) {
        return applicationRepository.findByUserId(userId, pageable)
                .map(app -> {
                    ApplicationSummaryResponse res = applicationMapper.toSummaryResponse(app);
                    ApplicationScore score = app.getApplicationScore();
                    if (score != null && score.isCandidatePaid()) {
                        res.setOverallScore(score.getOverallScore());
                        res.setGrade(score.getGrade() != null ? score.getGrade().name() : null);
                    }
                    if (app.getInterviewRounds() != null && !app.getInterviewRounds().isEmpty()) {
                        List<ApplicationInterviewRound> sortedRounds = app.getInterviewRounds().stream()
                                .sorted(Comparator.comparing(r -> r.getJobInterviewRound().getRoundNumber()))
                                .toList();
                        List<ApplicationInterviewRoundResponse> roundResponses = sortedRounds.stream()
                                .map(this::toRoundResponse).toList();
                        res.setInterviewRounds(roundResponses);

                        ApplicationInterviewRound latestRound = sortedRounds.get(sortedRounds.size() - 1);
                        res.setInterviewRoundStatus(latestRound.getStatus() != null ? latestRound.getStatus().name() : null);
                        res.setRescheduleCount(latestRound.getRescheduleCount());
                        res.setCandidatePreferredTime(latestRound.getCandidatePreferredTime());
                        res.setCandidateRescheduleReason(latestRound.getCandidateRescheduleReason());
                        res.setScheduledTime(latestRound.getScheduledTime());
                    }
                    return res;
                });
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId) {
        Application application = getApplicationEntityById(applicationId);

        boolean isApplicant = application.getUser().getId().equals(userId);
        boolean isCompanyMember = application.getJob() != null
                && application.getJob().getCompany() != null
                && companyService.getMemberByCompanyIdAndUserId(
                        application.getJob().getCompany().getId(), userId).isPresent();

        if (!isApplicant && !isCompanyMember) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to view this application");
        }

        ApplicationDetailResponse response = applicationMapper.toDetailResponse(application);

        if (application.getInterviewRounds() != null && !application.getInterviewRounds().isEmpty()) {
            List<ApplicationInterviewRound> sortedRounds = application.getInterviewRounds().stream()
                    .sorted(Comparator.comparing(r -> r.getJobInterviewRound().getRoundNumber()))
                    .toList();
            List<ApplicationInterviewRoundResponse> roundResponses = sortedRounds.stream()
                    .map(this::toRoundResponse).toList();
            response.setInterviewRounds(roundResponses);

            ApplicationInterviewRound latestRound = sortedRounds.get(sortedRounds.size() - 1);
            response.setInterviewRoundStatus(latestRound.getStatus() != null ? latestRound.getStatus().name() : null);
            response.setCandidatePreferredInterviewDateTime(latestRound.getCandidatePreferredTime());
            response.setCandidateInterviewResponseMessage(latestRound.getCandidateRescheduleReason());
            response.setInterviewDateTime(latestRound.getScheduledTime());
        }

        ApplicationScore score = application.getApplicationScore();
        if (score != null) {
            boolean hasPaid = isApplicant && score.isCandidatePaid() || isCompanyMember && score.isCompanyPaid();
            if (!hasPaid) {
                response.setOverallScore(null);
                response.setGrade(null);
                response.setAiSummary(null);
                response.setAiSuggestion(null);
            }
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, ApplicationStatus status,
            Pageable pageable) {
        Page<Application> page = (status != null)
                ? applicationRepository.findByJobIdAndStatus(jobId, status, pageable)
                : applicationRepository.findByJobId(jobId, pageable);

        return page.map(app -> {
            ApplicationSummaryResponse res = applicationMapper.toSummaryResponse(app);
            ApplicationScore score = app.getApplicationScore();
            if (score != null && score.isCompanyPaid()) {
                res.setOverallScore(score.getOverallScore());
                res.setGrade(score.getGrade() != null ? score.getGrade().name() : null);
            }
            if (app.getInterviewRounds() != null && !app.getInterviewRounds().isEmpty()) {
                List<ApplicationInterviewRound> sortedRounds = app.getInterviewRounds().stream()
                        .sorted(Comparator.comparing(r -> r.getJobInterviewRound().getRoundNumber()))
                        .toList();
                List<ApplicationInterviewRoundResponse> roundResponses = sortedRounds.stream()
                        .map(this::toRoundResponse).toList();
                res.setInterviewRounds(roundResponses);

                ApplicationInterviewRound latestRound = sortedRounds.get(sortedRounds.size() - 1);
                res.setInterviewRoundStatus(latestRound.getStatus() != null ? latestRound.getStatus().name() : null);
                res.setRescheduleCount(latestRound.getRescheduleCount());
                res.setCandidatePreferredTime(latestRound.getCandidatePreferredTime());
                res.setCandidateRescheduleReason(latestRound.getCandidateRescheduleReason());
                res.setScheduledTime(latestRound.getScheduledTime());
            }
            return res;
        });
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
    public boolean hasCandidatesInRound(UUID jobInterviewRoundId) {
        if (jobInterviewRoundId == null)
            return false;
        return applicationInterviewRoundRepository.existsByJobInterviewRoundId(jobInterviewRoundId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.countByStatus(status);
    }
    // ─── SCORING METHOD ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId) {
        Application application = getApplicationEntityById(applicationId);

        boolean isApplicant = application.getUser().getId().equals(userId);
        boolean isCompanyMember = application.getJob() != null
                && application.getJob().getCompany() != null
                && companyService.getMemberByCompanyIdAndUserId(
                        application.getJob().getCompany().getId(), userId).isPresent();

        if (!isApplicant && !isCompanyMember) {
            throw new AppException(ErrorCode.FORBIDDEN, "You do not have permission to score this application");
        }

        ApplicationScore existingScore = application.getApplicationScore();

        // 1. Candidate paid
        if (isApplicant) {
            if (existingScore != null) {
                if (existingScore.isCandidatePaid()) {
                    throw new AppException(ErrorCode.INVALID_INPUT,
                            "Bạn đã thanh toán để chấm điểm đơn ứng tuyển này rồi.");
                }
                if (!creditService.hasCandidateFeatureAccess(userId, "APP_SCORING")) {
                    throw new AppException(ErrorCode.FORBIDDEN,
                            "Gói của bạn không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
                }
                creditService.deductCandidateQuota(userId, "APP_SCORING", 1);
                existingScore.setCandidatePaid(true);
                applicationScoreRepository.save(existingScore);

                // Return updated detail (it will now be visible since candidatePaid is true)
                return getApplicationDetail(userId, applicationId);
            } else {
                if (!creditService.hasCandidateFeatureAccess(userId, "APP_SCORING")) {
                    throw new AppException(ErrorCode.FORBIDDEN,
                            "Gói của bạn không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
                }
                creditService.deductCandidateQuota(userId, "APP_SCORING", 1);
                ApplicationScore newScore = calculateAndSaveScore(application, true, false);
                application.setApplicationScore(newScore);
                return getApplicationDetail(userId, applicationId);
            }
        }

        // 2. Recruiter paid
        if (isCompanyMember) {
            if (existingScore != null) {
                if (existingScore.isCompanyPaid()) {
                    throw new AppException(ErrorCode.INVALID_INPUT,
                            "Công ty của bạn đã thanh toán để chấm điểm đơn ứng tuyển này rồi.");
                }
                if (!creditService.hasCompanyFeatureAccessByUserId(userId, "APP_SCORING")) {
                    throw new AppException(ErrorCode.FORBIDDEN,
                            "Gói của công ty không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
                }
                creditService.deductCompanyFeatureQuota(userId, "APP_SCORING", 1);
                existingScore.setCompanyPaid(true);
                applicationScoreRepository.save(existingScore);

                return getApplicationDetail(userId, applicationId);
            } else {
                if (!creditService.hasCompanyFeatureAccessByUserId(userId, "APP_SCORING")) {
                    throw new AppException(ErrorCode.FORBIDDEN,
                            "Gói của công ty không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
                }
                creditService.deductCompanyFeatureQuota(userId, "APP_SCORING", 1);
                ApplicationScore newScore = calculateAndSaveScore(application, false, true);
                application.setApplicationScore(newScore);
                return getApplicationDetail(userId, applicationId);
            }
        }

        throw new AppException(ErrorCode.FORBIDDEN, "Access denied");
    }

    private ApplicationScore calculateAndSaveScore(Application application, boolean candidatePaid,
            boolean companyPaid) {
        try {
            SkillMatchScoreResponse matchScore = recommendationService.calculateMatchScore(application.getCv().getId(),
                    application.getJob().getId());
            ScoreGrade grade = matchScore.getGrade();

            double scorePercent = matchScore.getOverallScore() * 100;
            String summary = String.format(
                    "Độ tương thích CV của ứng viên đạt %.1f%%. Hệ thống ghi nhận đã khớp %d kỹ năng và thiếu %d kỹ năng so với mô tả công việc.",
                    scorePercent,
                    matchScore.getMatchedSkills().size(),
                    matchScore.getMissingSkills().size());

            StringBuilder suggestion = new StringBuilder();
            suggestion.append("Kỹ năng phù hợp:\n");
            if (!matchScore.getMatchedSkills().isEmpty()) {
                for (String s : matchScore.getMatchedSkills()) {
                    suggestion.append(" - ").append(s).append("\n");
                }
            } else {
                suggestion.append(" - Không có kỹ năng nào trùng khớp.\n");
            }

            suggestion.append("\nKỹ năng còn thiếu hoặc cần bổ sung:\n");
            if (!matchScore.getMissingSkills().isEmpty()) {
                for (String s : matchScore.getMissingSkills()) {
                    suggestion.append(" - ").append(s).append("\n");
                }
            } else {
                suggestion.append(" - Ứng viên đã đáp ứng đầy đủ kỹ năng yêu cầu.\n");
            }

            ApplicationScore applicationScore = ApplicationScore.builder()
                    .application(application)
                    .candidatePaid(candidatePaid)
                    .companyPaid(companyPaid)
                    .overallScore(BigDecimal.valueOf(scorePercent))
                    .grade(grade)
                    .aiSummary(summary)
                    .aiSuggestion(suggestion.toString())
                    .modelVersion("1.0")
                    .scoredAt(Instant.now())
                    .build();

            applicationScore = applicationScoreRepository.save(applicationScore);

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
                    if (detail.getRequiredLevel() != null)
                        reqLevel = SkillLevel.valueOf(detail.getRequiredLevel());
                } catch (Exception ignored) {
                }

                SkillLevel candLevel = null;
                try {
                    if (detail.getCandidateLevel() != null)
                        candLevel = SkillLevel.valueOf(detail.getCandidateLevel());
                } catch (Exception ignored) {
                }

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

            return applicationScore;
        } catch (Exception e) {
            log.error("Failed to calculate AI match score for application {}", application.getId(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Failed to score application: " + e.getMessage());
        }
    }

    // ─── DASHBOARD METHODS ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ApplicationDashboardSummaryResponse getApplicationDashboardSummary(UUID userId) {
        long appliedCount = applicationRepository.countByUserId(userId);
        long interviewCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW);
        long savedCount = savedJobService.countSavedJobsByUserId(userId);
        long cvCount = cvService.countCvsByUserId(userId);
        return ApplicationDashboardSummaryResponse.builder()
                .appliedCount(appliedCount)
                .savedCount(savedCount)
                .cvCount(cvCount)
                .interviewCount(interviewCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentActivityResponse> getRecentApplicationsForDashboard(UUID userId, int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();
        List<Application> recentApplications = applicationRepository.findByUserIdOrderByAppliedAtDesc(
                userId, PageRequest.of(0, limit));

        recentApplications.forEach(app -> {
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
        List<Application> apps = applicationRepository.findByUserId(userId);
        Instant now = Instant.now();
        return apps.stream()
                .filter(a -> a.getInterviewRounds() != null)
                .flatMap(a -> a.getInterviewRounds().stream())
                .filter(r -> r.getScheduledTime() != null && !r.getScheduledTime().isBefore(now))
                .sorted(Comparator.comparing(ApplicationInterviewRound::getScheduledTime))
                .map(r -> UpcomingInterviewResponse.builder()
                        .company(r.getApplication().getJob() != null && r.getApplication().getJob().getCompany() != null
                                ? r.getApplication().getJob().getCompany().getName()
                                : "Nhà tuyển dụng")
                        .position(r.getApplication().getJob() != null ? r.getApplication().getJob().getTitle()
                                : "Vị trí không xác định")
                        .dateTime(r.getScheduledTime())
                        .meetUrl(r.getMeetingLink())
                        .location(r.getLocation())
                        .applicationId(r.getApplication().getId())
                        .build())
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
        long interviewingCount = countByStatusIn(apps, ApplicationStatus.INTERVIEW);
        long offerCount = countByStatusIn(apps, ApplicationStatus.ACCEPTED);

        return JobSearchAnalyticsResponse.builder()
                .funnelData(buildFunnelData(total, appliedCount, acceptedCount, interviewingCount, offerCount))
                .weeklyData(buildWeeklyData(apps))
                .monthlyData(buildMonthlyData(apps))
                .yearlyData(buildYearlyData(apps))
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
                .interviewAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW).count())
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
                .filter(a -> a.getInterviewRounds() != null)
                .flatMap(a -> a.getInterviewRounds().stream())
                .filter(r -> r.getScheduledTime() != null)
                .sorted(Comparator.comparing(ApplicationInterviewRound::getScheduledTime))
                .limit(4)
                .map(r -> RecruiterUpcomingInterviewResponse.builder()
                        .cvTitle(r.getApplication().getCv() != null ? r.getApplication().getCv().getTitle() : "CV")
                        .jobTitle(r.getApplication().getJob() != null ? r.getApplication().getJob().getTitle()
                                : "Vị trí tuyển dụng")
                        .interviewDateTime(r.getScheduledTime())
                        .status(r.getStatus().name())
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
            int yr = month.getYear();
            int mo = month.getMonthValue();
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
    // ─── BULK SCORING ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BulkScoreResponse bulkScoreByJob(UUID jobId, BulkScoreRequest request) {
        UUID currentUserId = authUtils.getCurrentUserId();

        // 1. Kiểm tra quyền truy cập tính năng APP_SCORING của công ty
        if (!creditService.hasCompanyFeatureAccessByUserId(currentUserId, "APP_SCORING")) {
            throw new AppException(ErrorCode.FORBIDDEN,
                    "Gói của công ty không có tính năng Chấm điểm CV (APP_SCORING). Vui lòng nâng cấp gói.");
        }

        // 2. Lấy toàn bộ application của job
        List<Application> allApps = applicationRepository.findByJobId(jobId);

        // 3. Phân loại: Các đơn SUBMITTED chưa được công ty chấm điểm -> Cần chấm
        List<Application> toScore = allApps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED
                        && (a.getApplicationScore() == null || !a.getApplicationScore().isCompanyPaid()))
                .toList();

        List<Application> alreadyScoredList = allApps.stream()
                .filter(a -> a.getApplicationScore() != null && a.getApplicationScore().isCompanyPaid())
                .toList();

        int alreadyScoredCount = alreadyScoredList.size();
        int autoRejected = 0;
        int failed = 0;

        // 4. Nếu có đơn chưa chấm: Trừ credit và chấm điểm từng đơn
        if (!toScore.isEmpty()) {
            creditService.deductCompanyFeatureQuota(currentUserId, "APP_SCORING", toScore.size());

            for (Application app : toScore) {
                try {
                    ApplicationScore score = calculateAndSaveScore(app, false, true);
                    app.setApplicationScore(score);
                    app.setStatus(ApplicationStatus.SCORED);

                    double scorePercent = score.getOverallScore().doubleValue();

                    if (request.isAutoRejectBelowThreshold() && scorePercent < request.getThresholdPercent()) {
                        app.setStatus(ApplicationStatus.REJECTED);
                        autoRejected++;
                        Application savedApp = applicationRepository.save(app);
                        notifyCandidateStatusAfterCommit(savedApp, ApplicationStatus.REJECTED);
                    } else {
                        applicationRepository.save(app);
                    }
                } catch (Exception e) {
                    log.warn("[BulkScore] Failed to score application {}: {}", app.getId(), e.getMessage());
                    failed++;
                }
            }
        }

        // 5. Nếu bật tự động từ chối dưới ngưỡng: Kiểm tra cả các đơn đã scored trước
        // đó
        if (request.isAutoRejectBelowThreshold()) {
            for (Application app : alreadyScoredList) {
                if (app.getStatus() == ApplicationStatus.SCORED && app.getApplicationScore() != null) {
                    double scorePercent = app.getApplicationScore().getOverallScore().doubleValue();
                    if (scorePercent < request.getThresholdPercent()) {
                        app.setStatus(ApplicationStatus.REJECTED);
                        Application savedApp = applicationRepository.save(app);
                        notifyCandidateStatusAfterCommit(savedApp, ApplicationStatus.REJECTED);
                        autoRejected++;
                    }
                }
            }
        }

        // 6. Trả về kết quả sau khi xử lý
        List<Application> refreshedAll = applicationRepository.findByJobId(jobId);
        List<ApplicationSummaryResponse> allResults = refreshedAll.stream()
                .map(applicationMapper::toSummaryResponse)
                .toList();

        int totalNewlyScored = toScore.size() - failed;

        long aboveThresholdCount = refreshedAll.stream()
                .filter(a -> a.getApplicationScore() != null
                        && a.getApplicationScore().getOverallScore().doubleValue() >= request.getThresholdPercent()
                        && a.getStatus() != ApplicationStatus.REJECTED)
                .count();

        return BulkScoreResponse.builder()
                .totalScored(totalNewlyScored)
                .autoRejectedCount(autoRejected)
                .aboveThresholdCount((int) aboveThresholdCount)
                .alreadyScoredCount(alreadyScoredCount)
                .failedCount(failed)
                .allApplications(allResults)
                .build();
    }

    @Override
    @Transactional
    public List<ApplicationSummaryResponse> bulkRejectApplications(List<UUID> applicationIds) {
        // Lấy currentUserId nội bộ từ SecurityContext (không nhận từ Controller)
        UUID currentUserId = authUtils.getCurrentUserId();

        List<Application> apps = applicationRepository.findAllByIdIn(applicationIds);

        List<Application> rejected = new ArrayList<>();
        for (Application app : apps) {
            // Xác nhận HR thuộc công ty của job
            boolean isCompanyMember = app.getJob() != null
                    && app.getJob().getCompany() != null
                    && companyService.getMemberByCompanyIdAndUserId(
                            app.getJob().getCompany().getId(), currentUserId).isPresent();

            if (!isCompanyMember) {
                log.warn("[BulkReject] User {} không có quyền reject application {}", currentUserId, app.getId());
                continue;
            }

            app.setStatus(ApplicationStatus.REJECTED);
            Application savedApp = applicationRepository.save(app);
            rejected.add(savedApp);
            notifyCandidateStatusAfterCommit(savedApp, ApplicationStatus.REJECTED);
        }

        return rejected.stream()
                .map(applicationMapper::toSummaryResponse)
                .toList();
    }

    // ─── INTERVIEW WORKFLOW METHODS ──────────────────────────────────────────

    @Override
    @Transactional
    public List<ApplicationSummaryResponse> scheduleMultiSlotInterview(ScheduleMultiSlotRequest request) {
        if (request.getSlots() != null && !request.getSlots().isEmpty() && !request.getApplicationIds().isEmpty()) {
            UUID jobId = getApplicationEntityById(request.getApplicationIds().get(0)).getJob().getId();

            // Validate: tất cả slot phải trong tương lai
            Instant now = Instant.now();
            for (InterviewSlotDto slot : request.getSlots()) {
                if (slot.getStartTime() != null && !slot.getStartTime().isAfter(now)) {
                    throw new AppException(ErrorCode.BAD_REQUEST,
                            "Thời gian bắt đầu của slot phỏng vấn phải là thời điểm trong tương lai!");
                }
            }

            // Validate: slot vòng N phải sau scheduledTime đã chốt của vòng N-1
            int currentRound = request.getRoundNumber();
            if (currentRound > 1) {
                int prevRoundNumber = currentRound - 1;
                // Lấy scheduledTime của vòng trước cho từng applicationId
                for (UUID appId : request.getApplicationIds()) {
                    applicationInterviewRoundRepository
                            .findByApplicationIdAndJobInterviewRoundRoundNumber(appId, prevRoundNumber)
                            .ifPresent(prevRound -> {
                                Instant prevScheduled = prevRound.getScheduledTime();
                                if (prevScheduled != null) {
                                    for (InterviewSlotDto slot : request.getSlots()) {
                                        if (slot.getStartTime() != null && !slot.getStartTime().isAfter(prevScheduled)) {
                                            Application app = prevRound.getApplication();
                                            String candidateName = app.getUser().getFirstName() + " " + app.getUser().getLastName();
                                            throw new AppException(ErrorCode.BAD_REQUEST,
                                                    "Slot phỏng vấn vòng " + currentRound
                                                    + " phải diễn ra SAU thời gian đã chốt của vòng " + prevRoundNumber
                                                    + " (" + prevScheduled.atZone(ZONE_VN).format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")) + ")"
                                                    + " cho ứng viên " + candidateName + "!");
                                        }
                                    }
                                }
                            });
                }
            }

            validateSlotOverlap(request.getSlots());
        }
        List<Application> updatedApps = new ArrayList<>();

        for (UUID appId : request.getApplicationIds()) {
            Application application = getApplicationEntityById(appId);
            Job job = application.getJob();

            JobInterviewRound jobRound = jobInterviewRoundRepository.findByJobIdAndRoundNumber(job.getId(), request.getRoundNumber())
                    .orElseGet(() -> {
                        JobInterviewRound newRound = JobInterviewRound.builder()
                                .job(job)
                                .roundNumber(request.getRoundNumber())
                                .roundName("Vòng " + request.getRoundNumber())
                                .build();
                        return jobInterviewRoundRepository.save(newRound);
                    });

            ApplicationInterviewRound appRound = applicationInterviewRoundRepository
                    .findByApplicationIdAndJobInterviewRoundRoundNumber(appId, request.getRoundNumber())
                    .orElseGet(() -> ApplicationInterviewRound.builder()
                            .application(application)
                            .jobInterviewRound(jobRound)
                            .build());

            InterviewRoundStatus previousStatus = appRound.getStatus();
            boolean isFirstTimeSendingSlots = (previousStatus == null || previousStatus == InterviewRoundStatus.NOT_STARTED);

            appRound.setStatus(InterviewRoundStatus.SLOTS_SENT);
            appRound.setNote(request.getNote());
            appRound = applicationInterviewRoundRepository.save(appRound);

            // Delete previous slots for this round so only newly sent/adjusted slots exist
            interviewSlotRepository.deleteByApplicationInterviewRoundId(appRound.getId());

            if (request.getSlots() != null && !request.getSlots().isEmpty()) {
                List<InterviewSlot> slotEntities = new ArrayList<>();
                for (InterviewSlotDto slotDto : request.getSlots()) {
                    InterviewSlot slotEntity = InterviewSlot.builder()
                            .applicationInterviewRound(appRound)
                            .startTime(slotDto.getStartTime())
                            .endTime(slotDto.getEndTime())
                            .location(slotDto.getLocation())
                            .meetingLink(slotDto.getMeetingLink())
                            .isSelected(false)
                            .isNewSlot(false)
                            .build();
                    slotEntities.add(slotEntity);
                }
                interviewSlotRepository.saveAll(slotEntities);
            }

            application.setStatus(ApplicationStatus.INTERVIEW);
            Application savedApp = applicationRepository.save(application);
            updatedApps.add(savedApp);

            // Notification & Email Dispatch
            try {
                notificationService.createAndSendNotification(
                        application.getUser().getId(),
                        "Khung giờ phỏng vấn mới",
                        "Nhà tuyển dụng đã gửi các khung giờ phỏng vấn cho vị trí " + job.getTitle() + ". Vui lòng chọn thời gian phù hợp.",
                        NotificationType.INTERVIEW_SCHEDULED,
                        application.getId().toString()
                );

                String companyName = job.getCompany() != null ? job.getCompany().getName() : "HR Tech";
                String candidateFullName = application.getUser().getFirstName() + " " + application.getUser().getLastName();
                notificationService.sendInterviewScheduleNotification(
                        application.getUser().getEmail(),
                        candidateFullName,
                        job.getTitle(),
                        jobRound.getRoundName(),
                        companyName,
                        application.getId().toString()
                );
            } catch (Exception e) {
                log.error("Failed to notify candidate for interview slots", e);
            }
        }

        return updatedApps.stream().map(applicationMapper::toSummaryResponse).toList();
    }

    @Override
    @Transactional
    public ApplicationInterviewRoundResponse selectInterviewSlot(UUID applicationId, Integer roundNumber, SelectSlotRequest request) {
        ApplicationInterviewRound appRound = applicationInterviewRoundRepository
                .findByApplicationIdAndJobInterviewRoundRoundNumber(applicationId, roundNumber)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Interview round not found"));

        InterviewSlot selectedSlot = interviewSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Interview slot not found"));

        // Reset other slots selection
        List<InterviewSlot> allSlots = interviewSlotRepository.findByApplicationInterviewRoundId(appRound.getId());
        for (InterviewSlot s : allSlots) {
            s.setIsSelected(s.getId().equals(selectedSlot.getId()));
        }
        interviewSlotRepository.saveAll(allSlots);

        appRound.setScheduledTime(selectedSlot.getStartTime());
        appRound.setLocation(selectedSlot.getLocation());
        appRound.setMeetingLink(selectedSlot.getMeetingLink());
        appRound.setStatus(InterviewRoundStatus.CONFIRMED);
        appRound = applicationInterviewRoundRepository.save(appRound);

        Application app = appRound.getApplication();
        app.setStatus(ApplicationStatus.INTERVIEW);
        applicationRepository.save(app);

        // Notify Recruiter
        if (app.getJob().getCreatedBy() != null) {
            try {
                notificationService.createAndSendNotification(
                        app.getJob().getCreatedBy().getId(),
                        "Lịch phỏng vấn đã chốt",
                        "Ứng viên " + app.getUser().getFirstName() + " " + app.getUser().getLastName() + " đã chốt thời gian phỏng vấn.",
                        NotificationType.INTERVIEW_SCHEDULED,
                        app.getId().toString()
                );
            } catch (Exception e) {
                log.error("Failed to notify recruiter on slot selection", e);
            }
        }

        return toRoundResponse(appRound);
    }

    @Override
    @Transactional
    public ApplicationInterviewRoundResponse requestInterviewReschedule(UUID applicationId, Integer roundNumber, RequestRescheduleRequest request) {
        ApplicationInterviewRound appRound = applicationInterviewRoundRepository
                .findByApplicationIdAndJobInterviewRoundRoundNumber(applicationId, roundNumber)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Interview round not found"));

        if (appRound.getStatus() == InterviewRoundStatus.PASSED ||
            appRound.getStatus() == InterviewRoundStatus.FAILED ||
            appRound.getStatus() == InterviewRoundStatus.TERMINATED ||
            appRound.getStatus() == InterviewRoundStatus.INTERVIEW_COMPLETED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vòng phỏng vấn này đã hoàn thành hoặc kết thúc, không thể yêu cầu đổi lịch nữa!");
        }

        if (request.getPreferredTime() != null) {
            if (request.getPreferredTime().isBefore(Instant.now())) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Thời gian bạn đề xuất phải diễn ra trong tương lai!");
            }

            // Check overlap with existing available slots sent by HR for this round
            List<InterviewSlot> existingSlots = interviewSlotRepository.findByApplicationInterviewRoundId(appRound.getId());
            if (existingSlots != null && !existingSlots.isEmpty()) {
                for (InterviewSlot slot : existingSlots) {
                    if (slot.getStartTime() != null) {
                        long diffMinutes = Math.abs(Duration.between(request.getPreferredTime(), slot.getStartTime()).toMinutes());
                        if (diffMinutes < 30) {
                            throw new AppException(ErrorCode.BAD_REQUEST, "Thời gian bạn đề xuất bị trùng (hoặc quá gần - dưới 30 phút) với một trong những lịch phỏng vấn Nhà tuyển dụng đã gửi sẵn! Vui lòng bấm chọn trực tiếp lịch đó thay vì yêu cầu đổi lịch.");
                        }
                    }
                }
            }
        }

        appRound.setCandidatePreferredTime(request.getPreferredTime());
        appRound.setCandidateRescheduleReason(request.getReason());
        appRound.setRescheduleCount((appRound.getRescheduleCount() == null ? 0 : appRound.getRescheduleCount()) + 1);
        appRound.setStatus(InterviewRoundStatus.RESCHEDULE_REQUESTED);
        appRound = applicationInterviewRoundRepository.save(appRound);

        Application app = appRound.getApplication();
        app.setStatus(ApplicationStatus.INTERVIEW);
        applicationRepository.save(app);

        if (app.getJob().getCreatedBy() != null) {
            try {
                notificationService.createAndSendNotification(
                        app.getJob().getCreatedBy().getId(),
                        "Yêu cầu đổi lịch phỏng vấn",
                        "Ứng viên " + app.getUser().getFirstName() + " " + app.getUser().getLastName() + " đề xuất đổi lịch phỏng vấn với lý do: " + request.getReason(),
                        NotificationType.INTERVIEW_SCHEDULED,
                        app.getId().toString()
                );
            } catch (Exception e) {
                log.error("Failed to notify recruiter on reschedule request", e);
            }
        }

        return toRoundResponse(appRound);
    }

    @Override
    @Transactional
    public ApplicationInterviewRoundResponse reviewInterviewReschedule(UUID applicationId, Integer roundNumber, ReviewRescheduleRequest request) {
        ApplicationInterviewRound appRound = applicationInterviewRoundRepository
                .findByApplicationIdAndJobInterviewRoundRoundNumber(applicationId, roundNumber)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Interview round not found"));

        if (appRound.getStatus() == InterviewRoundStatus.PASSED ||
            appRound.getStatus() == InterviewRoundStatus.FAILED ||
            appRound.getStatus() == InterviewRoundStatus.TERMINATED ||
            appRound.getStatus() == InterviewRoundStatus.INTERVIEW_COMPLETED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vòng phỏng vấn này đã hoàn thành hoặc kết thúc, không thể duyệt đổi lịch nữa!");
        }

        Application app = appRound.getApplication();

        if (Boolean.TRUE.equals(request.getAccepted())) {
            appRound.setScheduledTime(appRound.getCandidatePreferredTime());
            appRound.setCandidatePreferredTime(null);
            appRound.setCandidateRescheduleReason(null);
            appRound.setStatus(InterviewRoundStatus.CONFIRMED);
            app.setStatus(ApplicationStatus.INTERVIEW);
        } else {
            appRound.setHrRejectionReason(request.getRejectionReason());
            int count = appRound.getRescheduleCount() == null ? 0 : appRound.getRescheduleCount();
            if (count >= 3) {
                appRound.setStatus(InterviewRoundStatus.TERMINATED);
                app.setStatus(ApplicationStatus.REJECTED);
                appRound.setFeedbackNote("Đã dừng luồng do đổi lịch quá 3 lần. Lý do từ chối cuối: " + request.getRejectionReason());
            } else {
                appRound.setStatus(InterviewRoundStatus.RESCHEDULE_REJECTED);
                // Clear old slots and replace with newly adjusted slots provided by HR
                if (request.getNewSlots() != null && !request.getNewSlots().isEmpty()) {
                    validateSlotOverlap(request.getNewSlots());
                    interviewSlotRepository.deleteByApplicationInterviewRoundId(appRound.getId());
                    
                    List<InterviewSlot> slotEntities = new ArrayList<>();
                    for (InterviewSlotDto slotDto : request.getNewSlots()) {
                        boolean isNewlyAdded = Boolean.TRUE.equals(slotDto.getIsNewSlot());

                        InterviewSlot slotEntity = InterviewSlot.builder()
                                .applicationInterviewRound(appRound)
                                .startTime(slotDto.getStartTime())
                                .endTime(slotDto.getEndTime())
                                .location(slotDto.getLocation())
                                .meetingLink(slotDto.getMeetingLink())
                                .isSelected(false)
                                .isNewSlot(isNewlyAdded)
                                .build();
                        slotEntities.add(slotEntity);
                    }
                    interviewSlotRepository.saveAll(slotEntities);
                }
                app.setStatus(ApplicationStatus.INTERVIEW);
            }
        }

        appRound = applicationInterviewRoundRepository.save(appRound);
        applicationRepository.save(app);

        // Notify Candidate
        try {
            String title = Boolean.TRUE.equals(request.getAccepted()) ? "Lịch phỏng vấn đã được xác nhận" : "Thông báo về lịch phỏng vấn";
            String content = Boolean.TRUE.equals(request.getAccepted()) 
                    ? "Nhà tuyển dụng đã đồng ý với thời gian phỏng vấn bạn đề xuất." 
                    : "Nhà tuyển dụng đã cập nhật phản hồi lịch phỏng vấn.";
            notificationService.createAndSendNotification(
                    app.getUser().getId(),
                    title,
                    content,
                    NotificationType.INTERVIEW_SCHEDULED,
                    app.getId().toString()
            );

            // Gửi Email cho Candidate nếu HR từ chối đề xuất và gửi danh sách slot mới
            if (Boolean.FALSE.equals(request.getAccepted()) && appRound.getStatus() != InterviewRoundStatus.TERMINATED) {
                String companyName = app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "HR Tech";
                String candidateFullName = app.getUser().getFirstName() + " " + app.getUser().getLastName();
                String roundName = appRound.getJobInterviewRound() != null ? appRound.getJobInterviewRound().getRoundName() : ("Vòng " + roundNumber);
                notificationService.sendInterviewScheduleNotification(
                        app.getUser().getEmail(),
                        candidateFullName,
                        app.getJob().getTitle(),
                        roundName,
                        companyName,
                        app.getId().toString()
                );
            }
        } catch (Exception e) {
            log.error("Failed to notify candidate on reschedule review", e);
        }

        return toRoundResponse(appRound);
    }

    @Override
    @Transactional
    public ApplicationInterviewRoundResponse checkInInterviewRound(UUID applicationId, Integer roundNumber) {
        ApplicationInterviewRound appRound = applicationInterviewRoundRepository
                .findByApplicationIdAndJobInterviewRoundRoundNumber(applicationId, roundNumber)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Interview round not found"));

        appRound.setAttendedAt(Instant.now());
        appRound.setStatus(InterviewRoundStatus.ATTENDED);
        appRound = applicationInterviewRoundRepository.save(appRound);

        return toRoundResponse(appRound);
    }

    @Override
    @Transactional
    public ApplicationInterviewRoundResponse evaluateInterviewRound(UUID applicationId, Integer roundNumber, EvaluateRoundRequest request) {
        ApplicationInterviewRound appRound = applicationInterviewRoundRepository
                .findByApplicationIdAndJobInterviewRoundRoundNumber(applicationId, roundNumber)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Interview round not found"));

        Application app = appRound.getApplication();
        appRound.setRating(request.getRating());
        appRound.setFeedbackNote(request.getFeedbackNote());
        if (Boolean.TRUE.equals(request.getIsAttended())) {
            appRound.setAttendedAt(Instant.now());
        }

        if (Boolean.TRUE.equals(request.getPassed())) {
            appRound.setStatus(InterviewRoundStatus.PASSED);

            // Check if next round exists
            int nextRoundNum = roundNumber + 1;
            Optional<JobInterviewRound> nextJobRound = jobInterviewRoundRepository.findByJobIdAndRoundNumber(app.getJob().getId(), nextRoundNum);
            if (nextJobRound.isPresent()) {
                // Initialize next round for application
                ApplicationInterviewRound nextAppRound = applicationInterviewRoundRepository
                        .findByApplicationIdAndJobInterviewRoundRoundNumber(applicationId, nextRoundNum)
                        .orElseGet(() -> ApplicationInterviewRound.builder()
                                .application(app)
                                .jobInterviewRound(nextJobRound.get())
                                .status(InterviewRoundStatus.NOT_STARTED)
                                .build());
                applicationInterviewRoundRepository.save(nextAppRound);
                app.setStatus(ApplicationStatus.INTERVIEW);
            } else {
                // Passed final round -> INTERVIEW_COMPLETED
                appRound.setStatus(InterviewRoundStatus.INTERVIEW_COMPLETED);
                app.setStatus(ApplicationStatus.INTERVIEW);
            }
        } else {
            appRound.setStatus(InterviewRoundStatus.FAILED);
            app.setStatus(ApplicationStatus.REJECTED);
        }

        appRound = applicationInterviewRoundRepository.save(appRound);
        applicationRepository.save(app);

        notifyCandidateStatusAfterCommit(app, app.getStatus());

        return toRoundResponse(appRound);
    }

    @Override
    @Transactional
    public ApplicationSummaryResponse finalConfirmInterview(UUID applicationId, FinalConfirmationRequest request) {
        Application app = getApplicationEntityById(applicationId);

        if (Boolean.TRUE.equals(request.getApproved())) {
            app.setStatus(ApplicationStatus.ACCEPTED);
        } else {
            app.setStatus(ApplicationStatus.REJECTED);
        }

        List<ApplicationInterviewRound> rounds = applicationInterviewRoundRepository
                .findByApplicationIdOrderByJobInterviewRoundRoundNumberAsc(applicationId);
        if (rounds != null && !rounds.isEmpty()) {
            ApplicationInterviewRound finalRound = rounds.get(rounds.size() - 1);
            if (Boolean.TRUE.equals(request.getApproved())) {
                finalRound.setStatus(InterviewRoundStatus.PASSED);
            } else {
                finalRound.setStatus(InterviewRoundStatus.FAILED);
            }
            applicationInterviewRoundRepository.save(finalRound);
        }

        app = applicationRepository.save(app);
        notifyCandidateFinalOfferAfterCommit(app, Boolean.TRUE.equals(request.getApproved()));

        return applicationMapper.toSummaryResponse(app);
    }

    private void notifyCandidateFinalOfferAfterCommit(Application application, boolean approved) {
        String email = application.getUser().getEmail();
        String fullName = buildFullName(application.getUser());
        String jobTitle = application.getJob() != null ? application.getJob().getTitle() : null;
        String companyName = (application.getJob() != null && application.getJob().getCompany() != null)
                ? application.getJob().getCompany().getName()
                : null;
        String appIdStr = application.getId().toString();

        Runnable notificationTask = approved
                ? () -> notificationService.sendFinalOfferAcceptedNotification(email, fullName, jobTitle, companyName, appIdStr)
                : () -> notificationService.sendFinalOfferRejectedNotification(email, fullName, jobTitle, companyName, appIdStr);

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notificationTask.run();
                }
            });
        } else {
            notificationTask.run();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationInterviewRoundResponse> getApplicationInterviewRounds(UUID applicationId) {
        List<ApplicationInterviewRound> rounds = applicationInterviewRoundRepository
                .findByApplicationIdOrderByJobInterviewRoundRoundNumberAsc(applicationId);
        return rounds.stream().map(this::toRoundResponse).toList();
    }

    private ApplicationInterviewRoundResponse toRoundResponse(ApplicationInterviewRound round) {
        List<InterviewSlot> slotEntities = interviewSlotRepository.findByApplicationInterviewRoundId(round.getId());
        List<InterviewSlotDto> slotDtos = slotEntities.stream().map(s -> InterviewSlotDto.builder()
                .id(s.getId())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .location(s.getLocation())
                .meetingLink(s.getMeetingLink())
                .isSelected(s.getIsSelected())
                .isNewSlot(Boolean.TRUE.equals(s.getIsNewSlot()))
                .build()).toList();

        return ApplicationInterviewRoundResponse.builder()
                .id(round.getId())
                .applicationId(round.getApplication().getId())
                .roundNumber(round.getJobInterviewRound().getRoundNumber())
                .roundName(round.getJobInterviewRound().getRoundName())
                .status(round.getStatus())
                .scheduledTime(round.getScheduledTime())
                .location(round.getLocation())
                .meetingLink(round.getMeetingLink())
                .candidatePreferredTime(round.getCandidatePreferredTime())
                .candidateRescheduleReason(round.getCandidateRescheduleReason())
                .hrRejectionReason(round.getHrRejectionReason())
                .rescheduleCount(round.getRescheduleCount() == null ? 0 : round.getRescheduleCount())
                .feedbackNote(round.getFeedbackNote())
                .rating(round.getRating())
                .attendedAt(round.getAttendedAt())
                .slots(slotDtos)
                .build();
    }

    private void validateSlotOverlap(List<InterviewSlotDto> slots) {
        if (slots == null || slots.isEmpty()) return;

        // Chỉ kiểm tra các slot trong cùng 1 request không trùng nhau
        for (int i = 0; i < slots.size(); i++) {
            InterviewSlotDto s1 = slots.get(i);
            if (s1.getStartTime() == null || s1.getEndTime() == null) continue;

            for (int j = i + 1; j < slots.size(); j++) {
                InterviewSlotDto s2 = slots.get(j);
                if (s2.getStartTime() == null || s2.getEndTime() == null) continue;
                if (s1.getStartTime().isBefore(s2.getEndTime()) && s1.getEndTime().isAfter(s2.getStartTime())) {
                    throw new AppException(ErrorCode.BAD_REQUEST, "Các khung giờ phỏng vấn tạo ra bị trùng lặp thời gian với nhau! Vui lòng kiểm tra lại.");
                }
            }
        }
    }
}
