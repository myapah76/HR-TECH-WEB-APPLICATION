package hrtech.job.abstractions.repositories;

import hrtech.job.entities.JobAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobAuditLogRepository extends JpaRepository<JobAuditLog, UUID> {
    List<JobAuditLog> findAllByJobIdOrderByCreatedAtDesc(UUID jobId);

    Optional<JobAuditLog> findFirstByJobIdAndActionOrderByCreatedAtDesc(UUID jobId, String action);
}
