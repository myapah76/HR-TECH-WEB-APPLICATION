package hrtech.candidate.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDashboardSummaryResponse {
    private long appliedCount;
    private long savedCount;
    private long cvCount;
    private long interviewCount;
}
