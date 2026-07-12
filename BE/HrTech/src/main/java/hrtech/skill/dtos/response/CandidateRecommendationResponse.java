package hrtech.skill.dtos.response;

import hrtech.shared.enums.ScoreGrade;
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
public class CandidateRecommendationResponse {

    private UUID userId;
    private String candidateName;
    private String avatarUrl;
    private String email;

    private UUID bestCvId;
    private String bestCvTitle;
    private String bestCvFileUrl;

    private double matchScore;      // 0.0 – 1.0
    private ScoreGrade matchGrade;  // EXCELLENT, GOOD, FAIR, POOR

    private List<String> matchedSkills;
    private List<String> missingSkills;
}
