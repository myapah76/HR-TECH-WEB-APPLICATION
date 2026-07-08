package hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRelationshipResponse {
    private String sourceSkillId;
    private String sourceSkillName;
    private String targetSkillId;
    private String targetSkillName;
    private String relationshipType; // SYNONYM or RELATED_TO
}
