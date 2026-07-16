package hrtech.company.abstractions.services;

import hrtech.company.dtos.response.RecruiterActiveJobResponse;
import hrtech.company.dtos.response.RecruiterAnalyticsResponse;
import hrtech.company.dtos.response.RecruiterDashboardSummaryResponse;
import hrtech.company.dtos.response.RecruiterUpcomingInterviewResponse;

import java.util.List;

public interface ICompanyDashboardService {

    RecruiterDashboardSummaryResponse getRecruiterDashboardSummary();

    List<RecruiterUpcomingInterviewResponse> getRecruiterUpcomingInterviews();

    List<RecruiterActiveJobResponse> getRecruiterActiveJobs();

    RecruiterAnalyticsResponse getRecruiterAnalytics();
}
