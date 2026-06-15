package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobExtractResponseDto {
    private List<ExtractedSkillDto> skills;
}
