package hrtech.job.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record JobSkillRequest(
                @NotBlank(message = "Skill Neo4j ID is required") String skillNeo4jId,

                String requiredLevel) {
}
