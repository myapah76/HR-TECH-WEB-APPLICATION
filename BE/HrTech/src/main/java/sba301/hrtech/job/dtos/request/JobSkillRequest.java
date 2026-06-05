package sba301.hrtech.job.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JobSkillRequest(
        @NotBlank(message = "Skill Neo4j ID is required")
        String skillNeo4jId,

        @NotNull(message = "Required level is required")
        String requiredLevel,

        @NotNull(message = "isMandatory is required")
        Boolean isMandatory
) {}
