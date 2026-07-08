package hrtech.application.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.application.entities.AiMatchHistory;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiMatchHistoryRepository extends JpaRepository<AiMatchHistory, UUID> {
    Optional<AiMatchHistory> findByCvIdAndJobId(UUID cvId, UUID jobId);
}
