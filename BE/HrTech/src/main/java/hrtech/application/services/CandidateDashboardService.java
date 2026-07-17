package hrtech.application.services;

import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.dtos.response.*;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.job.abstractions.services.ISavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Aggregates candidate-facing dashboard data from multiple domains
 * (application, saved-job, cv). Kept separate from ApplicationQueryService
 * because it crosses domain boundaries.
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CandidateDashboardService {

    private static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final IApplicationService applicationService;
    private final ISavedJobService savedJobService;
    private final ICvService cvService;

    public CandidateDashboardSummaryResponse getDashboardSummary(UUID userId) {
        return CandidateDashboardSummaryResponse.builder()
                .appliedCount(applicationService.countApplicationsByUserId(userId))
                .savedCount(savedJobService.countSavedJobsByUserId(userId))
                .cvCount(cvService.countCvsByUserId(userId))
                .interviewCount(
                        applicationService.countApplicationsByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW))
                .build();
    }

    public List<RecentActivityResponse> getRecentActivities(UUID userId, int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();

        applicationService.getRecentApplications(userId, limit).forEach(app -> {
            String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí tuyển dụng";
            activities.add(RecentActivityResponse.builder()
                    .action("Nộp hồ sơ ứng tuyển vị trí: " + jobTitle)
                    .date(app.getAppliedAt())
                    .status("submitted")
                    .build());
        });

        savedJobService.getRecentSavedJobs(userId, limit).forEach(savedJob -> {
            String jobTitle = savedJob.getJob() != null ? savedJob.getJob().getTitle() : "Việc làm";
            String companyName = (savedJob.getJob() != null && savedJob.getJob().getCompany() != null)
                    ? savedJob.getJob().getCompany().getName()
                    : "Nhà tuyển dụng";
            activities.add(RecentActivityResponse.builder()
                    .action("Lưu việc làm: " + jobTitle + " tại " + companyName)
                    .date(savedJob.getCreatedAt())
                    .status("saved")
                    .build());
        });

        return activities.stream()
                .sorted(Comparator.comparing(RecentActivityResponse::getDate).reversed())
                .limit(limit)
                .toList();
    }

    public List<UpcomingInterviewResponse> getUpcomingInterviews(UUID userId) {
        return applicationService.getUpcomingInterviews(userId).stream()
                .map(this::toUpcomingInterviewResponse)
                .toList();
    }

    public JobSearchAnalyticsResponse getJobSearchAnalytics(UUID userId) {
        List<Application> apps = applicationService.getAllApplicationsByUserId(userId);
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

    // ── Private helpers ──────────────────────────────────────────────────────

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
}
