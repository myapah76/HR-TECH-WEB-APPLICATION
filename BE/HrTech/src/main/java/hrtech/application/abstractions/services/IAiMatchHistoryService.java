package hrtech.application.abstractions.services;

import hrtech.application.entities.AiMatchHistory;

import java.util.Optional;
import java.util.UUID;

public interface IAiMatchHistoryService {
    Optional<AiMatchHistory> getHistoryEntityByCvAndJob(UUID cvId, UUID jobId);

    AiMatchHistory saveHistoryEntity(AiMatchHistory history);
}
