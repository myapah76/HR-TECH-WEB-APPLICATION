package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRecommendationResponse {

    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private String location;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    private double matchScore;       // Final hybrid score (0.0 - 1.0)
    private double graphScore;       // Graph-based score
    private double embeddingScore;   // Embedding similarity score
    private String matchGrade;       // EXCELLENT, GOOD, FAIR, POOR

    private List<String> matchedSkills;
    private List<String> missingSkills;
}
