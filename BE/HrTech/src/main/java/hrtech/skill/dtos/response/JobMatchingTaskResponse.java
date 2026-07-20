package hrtech.skill.dtos.response;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class JobMatchingTaskResponse {
    private String taskId;
    private String cvId;
    private String status;
    private String message;
    private int progressPercentage;
    private List<JobRecommendationResponse> recommendedJobs;
}
