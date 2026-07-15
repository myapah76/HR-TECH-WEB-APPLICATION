package hrtech.candidate.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.candidate.abstractions.services.CandidateService;
import hrtech.candidate.dtos.CandidateDashboardSummaryResponse;
import hrtech.candidate.dtos.RecentActivityResponse;
import hrtech.application.abstractions.services.ApplicationService;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.job.abstractions.services.ISavedJobService;
import hrtech.job.entities.SavedJob;
import hrtech.cv.abstractions.services.ICvService;

import hrtech.candidate.dtos.UpcomingInterviewResponse;
import hrtech.candidate.dtos.JobSearchAnalyticsResponse;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidateServiceImpl implements CandidateService {

    private final ApplicationService applicationService;
    private final ISavedJobService savedJobService;
    private final ICvService cvService;

    @Override
    public CandidateDashboardSummaryResponse getCandidateDashboardSummary(UUID userId) {
        long appliedCount = applicationService.countApplicationsByUserId(userId);
        long savedCount = savedJobService.countSavedJobsByUserId(userId);
        long cvCount = cvService.countCvsByUserId(userId);
        long interviewCount = applicationService.countApplicationsByUserIdAndStatus(userId,
                ApplicationStatus.INTERVIEW);

        return CandidateDashboardSummaryResponse.builder()
                .appliedCount(appliedCount)
                .savedCount(savedCount)
                .cvCount(cvCount)
                .interviewCount(interviewCount)
                .build();
    }

    @Override
    public List<RecentActivityResponse> getRecentActivities(UUID userId, int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();

        // Fetch recent applications
        List<Application> recentApplications = applicationService.getRecentApplications(userId, limit);
        for (Application app : recentApplications) {
            String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí tuyển dụng";
            activities.add(RecentActivityResponse.builder()
                    .action("Nộp hồ sơ ứng tuyển vị trí: " + jobTitle)
                    .date(app.getAppliedAt())
                    .status("submitted")
                    .build());
        }

        // Fetch recent saved jobs
        List<SavedJob> recentSavedJobs = savedJobService.getRecentSavedJobs(userId, limit);
        for (SavedJob savedJob : recentSavedJobs) {
            String jobTitle = savedJob.getJob() != null ? savedJob.getJob().getTitle() : "Việc làm";
            String companyName = (savedJob.getJob() != null && savedJob.getJob().getCompany() != null)
                    ? savedJob.getJob().getCompany().getName()
                    : "Nhà tuyển dụng";
            activities.add(RecentActivityResponse.builder()
                    .action("Lưu việc làm: " + jobTitle + " tại " + companyName)
                    .date(savedJob.getCreatedAt())
                    .status("saved")
                    .build());
        }

        // Sort by date descending and return top limit
        activities.sort(Comparator.comparing(RecentActivityResponse::getDate).reversed());
        return activities.stream().limit(limit).toList();
    }

    @Override
    public List<UpcomingInterviewResponse> getUpcomingInterviews(UUID userId) {

        List<Application> interviews = applicationService.getUpcomingInterviews(userId);

        return interviews.stream().map(app -> {

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
        }).toList();
    }

    @Override
    public JobSearchAnalyticsResponse getJobSearchAnalytics(UUID userId) {
        List<Application> apps = applicationService.getAllApplicationsByUserId(userId);
        long total = apps.size();

        // 1. Funnel Data calculation
        long appliedCount = total;
        long acceptedCount = apps.stream()
                .filter(app -> app.getStatus() != ApplicationStatus.SUBMITTED
                        && app.getStatus() != ApplicationStatus.WITHDRAWN
                        && app.getStatus() != ApplicationStatus.REJECTED)
                .count();

        long interviewingCount = apps.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.PENDING_INTERVIEW_SCHEDULE
                        || app.getStatus() == ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE
                        || app.getStatus() == ApplicationStatus.INTERVIEW
                        || app.getStatus() == ApplicationStatus.INTERVIEW_COMPLETED)
                .count();

        long offerCount = apps.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.ACCEPTED)
                .count();

        List<JobSearchAnalyticsResponse.FunnelStageDto> funnelData = List.of(
                JobSearchAnalyticsResponse.FunnelStageDto.builder()
                        .stage("Đã nộp CV")
                        .count(appliedCount)
                        .percent(total > 0 ? Math.round((appliedCount * 100.0) / total) : 0.0)
                        .build(),
                JobSearchAnalyticsResponse.FunnelStageDto.builder()
                        .stage("CV được chấp nhận")
                        .count(acceptedCount)
                        .percent(total > 0 ? Math.round((acceptedCount * 100.0) / total) : 0.0)
                        .build(),
                JobSearchAnalyticsResponse.FunnelStageDto.builder()
                        .stage("Đang phỏng vấn")
                        .count(interviewingCount)
                        .percent(total > 0 ? Math.round((interviewingCount * 100.0) / total) : 0.0)
                        .build(),
                JobSearchAnalyticsResponse.FunnelStageDto.builder()
                        .stage("Nhận Offer thành công")
                        .count(offerCount)
                        .percent(total > 0 ? Math.round((offerCount * 100.0) / total) : 0.0)
                        .build()
        );

        // Timezone standard for formatting
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(zoneId);

        // 2. Weekly Data (7 days)
        List<JobSearchAnalyticsResponse.ChartItemDto> weeklyData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String label = d.format(DateTimeFormatter.ofPattern("dd/MM"));
            long count = apps.stream()
                    .filter(app -> app.getAppliedAt() != null)
                    .filter(app -> app.getAppliedAt().atZone(zoneId).toLocalDate().equals(d))
                    .count();
            weeklyData.add(new JobSearchAnalyticsResponse.ChartItemDto(label, count));
        }

        // 3. Monthly Data (6 months)
        List<JobSearchAnalyticsResponse.ChartItemDto> monthlyData = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusMonths(i);
            String label = "T" + d.getMonthValue() + "/" + String.format("%02d", d.getYear() % 100);
            long count = apps.stream()
                    .filter(app -> app.getAppliedAt() != null)
                    .filter(app -> {
                        ZonedDateTime appliedDateTime = app.getAppliedAt().atZone(zoneId);
                        return appliedDateTime.getYear() == d.getYear() && appliedDateTime.getMonthValue() == d.getMonthValue();
                    })
                    .count();
            monthlyData.add(new JobSearchAnalyticsResponse.ChartItemDto(label, count));
        }

        // 4. Yearly Data (3 years)
        List<JobSearchAnalyticsResponse.ChartItemDto> yearlyData = new ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            int targetYear = today.getYear() - i;
            String label = String.valueOf(targetYear);
            long count = apps.stream()
                    .filter(app -> app.getAppliedAt() != null)
                    .filter(app -> app.getAppliedAt().atZone(zoneId).getYear() == targetYear)
                    .count();
            yearlyData.add(new JobSearchAnalyticsResponse.ChartItemDto(label, count));
        }

        return JobSearchAnalyticsResponse.builder()
                .funnelData(funnelData)
                .weeklyData(weeklyData)
                .monthlyData(monthlyData)
                .yearlyData(yearlyData)
                .build();
    }
}
