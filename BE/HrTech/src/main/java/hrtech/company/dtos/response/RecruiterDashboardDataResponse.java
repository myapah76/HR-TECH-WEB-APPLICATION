package hrtech.company.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterDashboardDataResponse {
    private RecruiterDashboardSummaryResponse summary;
    private List<RecruiterUpcomingInterviewResponse> upcomingInterviews;
    private List<RecruiterActiveJobResponse> activeJobs;
    private List<RecruiterAnalyticsItem> analytics;
}
