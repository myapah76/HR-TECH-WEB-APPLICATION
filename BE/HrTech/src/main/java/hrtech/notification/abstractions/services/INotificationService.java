package hrtech.notification.abstractions.services;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import hrtech.notification.dtos.request.ApplicationStatusNotificationRequest;
import hrtech.notification.dtos.request.OtpNotificationRequest;
import hrtech.notification.dtos.response.NotificationResponse;
import hrtech.notification.entities.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface INotificationService {
    void OtpNotificationHandler(OtpNotificationRequest request);
    void ApplicationStatusNotificationHandler(ApplicationStatusNotificationRequest request);

    SseEmitter createConnection(UUID userId);
    void createAndSendNotification(
            UUID targetUserId, String title, String content, NotificationType type, String referenceId
    );
    void createAndSendNotification(
            List<UUID> targetUserIds, String title, String content, NotificationType type, String referenceId
    );
    List<NotificationResponse> getNotificationsForUser(UUID userId);
    void markAsRead(UUID notificationId);
    long getUnreadCount(UUID userId);
}
