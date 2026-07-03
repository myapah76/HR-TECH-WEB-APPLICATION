package sba301.hrtech.notification.abstractions.services;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import sba301.hrtech.notification.dtos.request.ApplicationStatusNotificationRequest;
import sba301.hrtech.notification.dtos.request.OtpNotificationRequest;
import sba301.hrtech.notification.dtos.response.NotificationResponse;
import sba301.hrtech.notification.entities.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface INotificationService {
    void OtpNotificationHandler(OtpNotificationRequest request);
    void ApplicationStatusNotificationHandler(ApplicationStatusNotificationRequest request);

    SseEmitter createConnection(UUID userId);
    NotificationResponse createAndSendNotification(
            UUID targetUserId, String title, String content, NotificationType type, String referenceId
    );
    List<NotificationResponse> getNotificationsForUser(UUID userId);
    void markAsRead(UUID notificationId);
    long getUnreadCount(UUID userId);
}
