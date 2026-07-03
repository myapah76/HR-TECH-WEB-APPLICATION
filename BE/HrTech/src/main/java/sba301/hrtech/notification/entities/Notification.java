package sba301.hrtech.notification.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.notification.entities.enums.NotificationType;
import sba301.hrtech.shared.common.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "reference_id")
    private String referenceId; // ID của thực thể liên quan (ví dụ: Job ID, Application ID)
}