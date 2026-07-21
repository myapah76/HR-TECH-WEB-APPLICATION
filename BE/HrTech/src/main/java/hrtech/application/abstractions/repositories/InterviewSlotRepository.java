package hrtech.application.abstractions.repositories;

import hrtech.application.entities.InterviewSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewSlotRepository extends JpaRepository<InterviewSlot, UUID> {
    List<InterviewSlot> findByApplicationInterviewRoundId(UUID roundId);
    void deleteByApplicationInterviewRoundId(UUID roundId);
}
