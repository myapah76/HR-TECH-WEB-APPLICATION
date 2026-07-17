package hrtech.job.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewJobPostingResponse {
    private boolean approved;
    private List<String> rejection_reasons;
    private List<String> suggestions;
    private String overall_message;
    private Map<String, Object> check_details;
}
