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
public class RecruiterAnalyticsResponse {
    private List<RecruiterAnalyticsItem> sevenDays;
    private List<RecruiterAnalyticsItem> sixMonths;
    private List<RecruiterAnalyticsItem> threeYears;
}
