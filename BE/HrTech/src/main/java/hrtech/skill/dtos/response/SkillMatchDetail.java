package hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillMatchDetail {

    private String skillName;
    private String skillNeo4jId;    // Neo4j ID of the skill
    private String matchType;       // EXACT, RELATED, CHILD_TO_PARENT, PARENT_TO_CHILD, NONE
    private String requiredLevel;   // Job's required level
    private String candidateLevel;  // CV's proficiency level
    private String matchStatus;     // MATCHED, EXCEEDED, PARTIAL, MISSING
}
