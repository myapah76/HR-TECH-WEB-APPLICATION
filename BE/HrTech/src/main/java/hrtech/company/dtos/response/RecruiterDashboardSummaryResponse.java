package hrtech.company.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterDashboardSummaryResponse {
    private long activeJobsCount;
    private long totalApps;
    private long submittedAppsCount;
    private long screeningAppsCount;
    private long interviewAppsCount;
    private long offerAppsCount;
}
