package hrtech.notification.dtos.response;

import lombok.Builder;
import hrtech.notification.entities.enums.NotificationType;

import java.time.Instant;
import java.util.UUID;

@Builder
public record NotificationResponse(
        UUID id,
        String title,
        String content,
        boolean isRead,
        NotificationType type,
        String referenceId,
        Instant createdAt
) {}
