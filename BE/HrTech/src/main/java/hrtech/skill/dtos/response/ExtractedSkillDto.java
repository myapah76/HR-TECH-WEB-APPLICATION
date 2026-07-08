package hrtech.skill.dtos.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a skill extracted by Gemini AI from CV text.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExtractedSkillDto {

    private String name;
    private String level; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
}
