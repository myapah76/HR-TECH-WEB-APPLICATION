package hrtech.job.abstractions.repositories;

import hrtech.job.entities.JobAuditLog;
import hrtech.job.entities.enums.JobAuditAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobAuditLogRepository extends JpaRepository<JobAuditLog, UUID> {
    Optional<JobAuditLog> findFirstByJobIdAndActionOrderByCreatedAtDesc(UUID jobId, JobAuditAction action);

    Optional<JobAuditLog> findFirstByJobIdAndToStatusOrderByCreatedAtDesc(UUID jobId, String toStatus);
}
