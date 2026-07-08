package hrtech.job.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.identity.entities.User;
import hrtech.job.entities.Job;
import hrtech.job.entities.SavedJob;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    boolean existsByUserAndJob(User user, Job job);
    Optional<SavedJob> findByUserAndJob(User user, Job job);
    Page<SavedJob> findByUser(User user, Pageable pageable);
}
