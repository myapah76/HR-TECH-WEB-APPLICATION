package hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParseExtractResponseDto {
    
    @JsonProperty("parsed_content")
    private String parsedContent;
    
    private List<ExtractedSkillDto> skills;
}
