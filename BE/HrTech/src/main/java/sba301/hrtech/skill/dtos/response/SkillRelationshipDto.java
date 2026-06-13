package sba301.hrtech.skill.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillRelationshipDto {
    @JsonProperty("new_skill")
    private String newSkill;
    
    @JsonProperty("related_to")
    private List<String> relatedTo;
}
