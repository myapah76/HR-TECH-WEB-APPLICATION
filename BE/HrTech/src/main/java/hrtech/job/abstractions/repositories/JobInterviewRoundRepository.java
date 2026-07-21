package hrtech.job.abstractions.repositories;

import hrtech.job.entities.JobInterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobInterviewRoundRepository extends JpaRepository<JobInterviewRound, UUID> {
    List<JobInterviewRound> findByJobIdOrderByRoundNumberAsc(UUID jobId);

    int countByJobId(UUID jobId);

    Optional<JobInterviewRound> findByIdAndJobId(UUID id, UUID jobId);
}
