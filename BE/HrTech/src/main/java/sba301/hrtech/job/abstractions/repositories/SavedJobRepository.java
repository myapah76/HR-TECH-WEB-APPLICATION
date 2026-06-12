package sba301.hrtech.job.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.SavedJob;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    boolean existsByUserAndJob(User user, Job job);
    Optional<SavedJob> findByUserAndJob(User user, Job job);
    Page<SavedJob> findByUser(User user, Pageable pageable);
}
