package hrtech.application.abstractions.services;

import hrtech.application.dtos.response.*;
import hrtech.shared.dtos.RecentActivityResponse;
import hrtech.application.dtos.request.SubmitApplicationRequest;
import hrtech.company.dtos.response.RecruiterActiveJobResponse;
import hrtech.company.dtos.response.RecruiterAnalyticsResponse;
import hrtech.company.dtos.response.RecruiterDashboardSummaryResponse;
import hrtech.company.dtos.response.RecruiterUpcomingInterviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;

public interface IApplicationService {
    ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request);

    Page<ApplicationSummaryResponse> getMyApplications(UUID userId, Pageable pageable);

    ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId);

    Application getApplicationEntityById(UUID applicationId);

    void withdrawApplication(UUID userId, UUID applicationId);

    ApplicationSummaryResponse acceptApplication(UUID applicationId);

    ApplicationSummaryResponse rejectApplication(UUID applicationId);

    Page<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId, ApplicationStatus status, Pageable pageable);

    ApplicationDetailResponse scoreApplication(UUID userId, UUID applicationId);

    boolean hasApplied(UUID userId, UUID jobId);

    boolean hasCandidatesInRound(UUID jobInterviewRoundId);

    long countApplicationsByStatus(ApplicationStatus status);

    ApplicationDashboardSummaryResponse getApplicationDashboardSummary(UUID userId);

    List<RecentActivityResponse> getRecentApplicationsForDashboard(UUID userId, int limit);

    List<UpcomingInterviewResponse> getUpcomingInterviewsForDashboard(UUID userId);

    JobSearchAnalyticsResponse getJobSearchAnalytics(UUID userId);

    RecruiterDashboardSummaryResponse getRecruiterDashboardSummary();

    List<RecruiterUpcomingInterviewResponse> getRecruiterUpcomingInterviews();

    RecruiterAnalyticsResponse getRecruiterAnalytics();

    List<RecruiterActiveJobResponse> getRecruiterActiveJobs();
}
