package hrtech.notification.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.entities.User;
import hrtech.notification.abstractions.repositories.NotificationRepository;
import hrtech.notification.dtos.response.NotificationResponse;
import hrtech.notification.entities.Notification;
import hrtech.notification.entities.enums.NotificationType;
import hrtech.notification.mapper.NotificationMapper;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.notification.abstractions.cache.IRedisIdempotencyService;
import hrtech.notification.abstractions.cache.IRedisOtpService;
import hrtech.notification.abstractions.cache.IRedisRateLimitService;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.abstractions.services.IEmailSender;
import hrtech.notification.dtos.request.OtpNotificationRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements INotificationService {

    private final IRedisOtpService otpService;
    private final IRedisRateLimitService rateLimitService;
    private final IRedisIdempotencyService idempotencyService;
    private final IEmailSender emailSender;
    private final IUserService userService;

    private final NotificationRepository notificationRepository;

    private final NotificationMapper notificationMapper;

    private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Override
    public void OtpNotificationHandler(OtpNotificationRequest request) {

        //IDENTITY CHECK
        if (idempotencyService.isProcessed(request.getId())) {
            return;
        }

        //RATE LIMIT CHECK
        if (!rateLimitService.isAllowed(request.getOtpType().toString(),request.getOtpRequest().email())) {
            log.warn("Rate limit hit for email {}", request.getOtpRequest().email());
            throw new AppException(ErrorCode.OTP_RATE_LIMIT_EXCEEDED, "Rate limit exceeded for email: " + request.getOtpRequest().email());
        }

        if(!otpService.saveOtp(request.getOtpType().toString(),request.getOtpRequest().email(), request.getOtpRequest().otp())){
            throw new AppException(ErrorCode.OTP_SAVE_FAILED, "Fail to save otp code with email: " + request.getOtpRequest().email());
        }

        //SEND EMAIL
        emailSender.sendOtpEmailAsync(request.getOtpRequest().email(), request.getOtpRequest().otp());

        //MARK AS PROCESSED
        idempotencyService.markProcessed(request.getId());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendApplicationAcceptedNotification(String email, String fullName, String jobTitle, String companyName, String applicationId) {
        try {
            emailSender.sendApplicationAcceptedEmailAsync(email, fullName, jobTitle, companyName);
        } catch (Exception e) {
            log.error("Failed to dispatch ACCEPTED email for application {} to {}", applicationId, email, e);
        }

        try {
            User user = userService.getUserEntityByEmail(email);
            if (user != null) {
                String title = "Hồ sơ ứng tuyển được chấp nhận";
                String content = "Chúc mừng! Hồ sơ của bạn cho vị trí " + jobTitle + " đã được chấp nhận.";
                createAndSendNotification(user.getId(), title, content, NotificationType.APPLICATION_STATUS_UPDATED, applicationId);
            }
        } catch (Exception e) {
            log.error("Failed to create and send real-time ACCEPTED notification for application {}", applicationId, e);
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendApplicationRejectedNotification(String email, String fullName, String jobTitle, String companyName, String applicationId) {
        try {
            emailSender.sendApplicationRejectedEmailAsync(email, fullName, jobTitle, companyName);
        } catch (Exception e) {
            log.error("Failed to dispatch REJECTED email for application {} to {}", applicationId, email, e);
        }

        try {
            User user = userService.getUserEntityByEmail(email);
            if (user != null) {
                String title = "Hồ sơ bị từ cối";
                String content = "Rất tiếc, hồ sơ của bạn cho vị trí " + jobTitle + " đã bị từ chối.";
                createAndSendNotification(user.getId(), title, content, NotificationType.APPLICATION_STATUS_UPDATED, applicationId);
            }
        } catch (Exception e) {
            log.error("Failed to create and send real-time REJECTED notification for application {}", applicationId, e);
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendInterviewScheduleNotification(String email, String fullName, String jobTitle, String roundName, String companyName, String applicationId) {
        try {
            emailSender.sendInterviewScheduleEmailAsync(email, fullName, jobTitle, roundName, companyName);
        } catch (Exception e) {
            log.error("Failed to dispatch INTERVIEW SCHEDULE email for application {} to {}", applicationId, email, e);
        }
    }

    @Override
    public SseEmitter createConnection(UUID userId) {
        // Cấu hình kết nối với timeout 30 phút (1,800,000 miligiây)
        SseEmitter emitter = new SseEmitter(1_800_000L);

        // Lấy danh sách kết nối hiện tại của email hoặc tạo mới danh sách dạng thread-safe
        List<SseEmitter> userEmitters = emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());
        userEmitters.add(emitter);
        // Biến dọn dẹp khi kết nối bị ngắt, timeout hoặc lỗi
        Runnable removeEmitter = () -> {
            List<SseEmitter> activeList = emitters.get(userId);
            if (activeList != null) {
                activeList.remove(emitter);
                if (activeList.isEmpty()) {
                    emitters.remove(userId); // Giải phóng RAM khi đóng toàn bộ tab
                }
            }
        };
        emitter.onCompletion(removeEmitter);
        emitter.onTimeout(removeEmitter);
        emitter.onError(e -> removeEmitter.run());
        // Gửi sự kiện ban đầu để xác nhận handshake thành công
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT_CONNECTION")
                    .data("Connected successfully!"));
        } catch (IOException e) {
            removeEmitter.run();
        }
        return emitter;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAndSendNotification(
            UUID targetUserId, String title, String content, NotificationType type, String referenceId
    ) {
        // Kiểm tra xem user có tồn tại không
        if(!userService.existsById(targetUserId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, "Target user not found with ID: " + targetUserId);
        }
        Notification notification = Notification.builder()
                .userId(targetUserId)
                .title(title)
                .content(content)
                .type(type)
                .referenceId(referenceId)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        NotificationResponse notificationResponse = notificationMapper.toResponse(saved);

        // Gửi Real-time qua TOÀN BỘ các luồng SSE đang mở của user này
        List<SseEmitter> userEmitters = emitters.get(targetUserId);
        if (userEmitters != null && !userEmitters.isEmpty()) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("NEW_NOTIFICATION")
                            .data(notificationResponse));
                } catch (IOException e) {
                    deadEmitters.add(emitter); // Đánh dấu các kết nối đã hỏng
                }
            }
            // Dọn dẹp các emitter đã chết sau khi gửi thất bại
            if(!deadEmitters.isEmpty()) {
                userEmitters.removeAll(deadEmitters);
                if (userEmitters.isEmpty()) {
                    emitters.remove(targetUserId);
                }
            }
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAndSendNotification(
            List<UUID> targetUserIds, String title, String content, NotificationType type, String referenceId
    ) {
        if (targetUserIds == null || targetUserIds.isEmpty()) {
            return;
        }
        for (UUID targetUserId : targetUserIds) {
            try {
                createAndSendNotification(targetUserId, title, content, type, referenceId);
            } catch (Exception e) {
                log.error("Failed to send notification to user " + targetUserId + ": " + e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(UUID userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
