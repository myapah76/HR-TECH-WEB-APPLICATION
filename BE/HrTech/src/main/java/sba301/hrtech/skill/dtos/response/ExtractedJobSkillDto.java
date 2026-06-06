package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedJobSkillDto {
    private String name;
    private String level;
    private Boolean isMandatory;
}
