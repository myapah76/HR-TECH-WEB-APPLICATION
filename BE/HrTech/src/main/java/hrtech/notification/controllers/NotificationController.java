package hrtech.notification.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import hrtech.identity.dtos.user.CustomUserDetails;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.dtos.response.NotificationResponse;
import hrtech.shared.response.ApiResponse;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final INotificationService notificationService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return notificationService.createConnection(userDetails.user().getId());
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.success(
                notificationService.getNotificationsForUser(userDetails.user().getId()),
                "Notifications retrieved successfully");
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getMyUnreadCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.success(
                notificationService.getUnreadCount(userDetails.user().getId()),
                "Unread notification count retrieved successfully");
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ApiResponse.success(null, "Notification marked as read");
    }
}