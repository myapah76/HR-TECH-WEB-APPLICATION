package hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResultResponse {

    private UUID cvId;
    private CvExtractionResponse extraction;
    private List<JobRecommendationResponse> recommendedJobs;
}
