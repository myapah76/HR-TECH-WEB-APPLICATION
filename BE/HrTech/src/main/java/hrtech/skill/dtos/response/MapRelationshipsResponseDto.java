package hrtech.skill.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapRelationshipsResponseDto {
    private List<SkillRelationshipDto> relationships;
}
