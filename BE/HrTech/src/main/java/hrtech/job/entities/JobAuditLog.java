package hrtech.job.entities;

import hrtech.shared.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import hrtech.identity.entities.User;

import java.util.UUID;

@Entity
@Table(name = "job_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAuditLog extends BaseEntity {

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "from_status")
    private String fromStatus;

    @Column(name = "to_status", nullable = false)
    private String toStatus;

    @Column(name = "action", nullable = false)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Column(name = "reason_or_notes", columnDefinition = "TEXT")
    private String reasonOrNotes;
}
