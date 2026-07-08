package hrtech.skill.dtos.response;

import hrtech.shared.enums.ScoreGrade;

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
    private ScoreGrade grade;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<SkillMatchDetail> skillDetails;
}
