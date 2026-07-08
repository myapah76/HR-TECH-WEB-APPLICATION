package hrtech.job.dtos.response;

import java.util.UUID;

public record JobSkillResponse(
        UUID id,
        String skillNeo4jId,
        String skillName,    // resolved from Neo4j
        String requiredLevel,
        Boolean isAiExtracted
) {}
