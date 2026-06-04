package sba301.hrtech.skill.dtos.response;

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
public class CvExtractionResponse {

    private UUID cvId;
    private List<SkillResponse> extractedSkills;
    private int newSkillsCount;
    private int matchedSkillsCount;
}
