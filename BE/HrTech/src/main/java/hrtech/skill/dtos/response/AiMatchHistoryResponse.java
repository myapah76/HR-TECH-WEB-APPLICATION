package hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import hrtech.shared.enums.ScoreGrade;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMatchHistoryResponse {
    private String id;
    private double overallScore;
    private ScoreGrade matchGrade;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<SkillMatchDetail> skillDetails;
    private String improvementTips;
    private List<String> actionPlan;
}
