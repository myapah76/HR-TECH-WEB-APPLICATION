package sba301.hrtech.skill.dtos.response;

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
    private String matchType;       // EXACT, SYNONYM, RELATED, SEMANTIC
    private String requiredLevel;   // Job's required level
    private String candidateLevel;  // CV's proficiency level
    private String matchStatus;     // MATCHED, EXCEEDED, PARTIAL, MISSING
    private double similarityScore; // Embedding cosine similarity (0.0 - 1.0)
}
