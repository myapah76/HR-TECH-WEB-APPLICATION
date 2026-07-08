package hrtech.interview.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import hrtech.interview.entities.InterviewResult;

import java.util.Optional;
import java.util.UUID;

public interface InterviewResultRepository extends JpaRepository<InterviewResult, UUID> {
    Optional<InterviewResult> findBySessionId(UUID sessionId);

    boolean existsBySessionId(UUID sessionId);
}

