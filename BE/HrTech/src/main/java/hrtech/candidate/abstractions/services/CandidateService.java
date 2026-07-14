package hrtech.candidate.abstractions.services;

import hrtech.candidate.dtos.CandidateDashboardSummaryResponse;
import hrtech.candidate.dtos.RecentActivityResponse;
import hrtech.candidate.dtos.UpcomingInterviewResponse;

import java.util.List;
import java.util.UUID;

public interface CandidateService {
    CandidateDashboardSummaryResponse getCandidateDashboardSummary(UUID userId);
    List<RecentActivityResponse> getRecentActivities(UUID userId, int limit);
    List<UpcomingInterviewResponse> getUpcomingInterviews(UUID userId);
}
