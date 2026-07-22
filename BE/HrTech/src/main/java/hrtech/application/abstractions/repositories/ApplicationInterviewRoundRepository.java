package hrtech.application.abstractions.repositories;

import hrtech.application.entities.ApplicationInterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationInterviewRoundRepository extends JpaRepository<ApplicationInterviewRound, UUID> {

    List<ApplicationInterviewRound> findByApplicationIdOrderByJobInterviewRoundRoundNumberAsc(UUID applicationId);

    Optional<ApplicationInterviewRound> findByApplicationIdAndJobInterviewRoundRoundNumber(UUID applicationId, Integer roundNumber);

    @Query("SELECT r FROM ApplicationInterviewRound r WHERE r.application.job.id = :jobId AND r.jobInterviewRound.roundNumber = :roundNumber")
    List<ApplicationInterviewRound> findByJobIdAndRoundNumber(@Param("jobId") UUID jobId, @Param("roundNumber") Integer roundNumber);

    boolean existsByJobInterviewRoundId(UUID jobInterviewRoundId);
}
