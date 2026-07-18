package hrtech.application.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    @EntityGraph(attributePaths = {"job", "job.company", "cv", "user"})
    List<Application> findByUserId(UUID userId);

    @EntityGraph(attributePaths = {"job", "job.company", "cv", "user"})
    Page<Application> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "cv", "user"})
    List<Application> findByJobId(UUID jobId);

    @EntityGraph(attributePaths = {"job", "job.company", "cv", "user"})
    List<Application> findByJobIdIn(Collection<UUID> jobIds);

    @EntityGraph(attributePaths = {"job", "job.company", "cv", "user"})
    Page<Application> findByJobId(UUID jobId, Pageable pageable);

    boolean existsByUserIdAndJobIdAndStatusNotIn(UUID userId, UUID jobId, Collection<ApplicationStatus> statuses);

    long countByStatus(ApplicationStatus status);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, ApplicationStatus status);

    List<Application> findByUserIdOrderByAppliedAtDesc(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "cv", "user"})
    List<Application> findByUserIdAndStatusAndInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(UUID userId, ApplicationStatus status, Instant now);

    long countByCreatedAtAfter(Instant date);
}

