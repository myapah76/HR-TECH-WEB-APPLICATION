package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillMatchScoreResponse {

    private double overallScore;
    private String grade;          // EXCELLENT, GOOD, FAIR, POOR
    private double graphScore;
    private double embeddingScore;
    private List<SkillMatchDetail> skillDetails;
}
