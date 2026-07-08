package hrtech.interview.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import hrtech.interview.entities.InterviewQuestion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {
    Optional<InterviewQuestion> findBySessionIdAndOrderIndex(UUID sessionId, int orderIndex);

    List<InterviewQuestion> findBySessionIdOrderByOrderIndexAsc(UUID sessionId);
}
