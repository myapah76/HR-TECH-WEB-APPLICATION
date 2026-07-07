package sba301.hrtech.notification.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import sba301.hrtech.identity.abstractions.services.IUserService;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.notification.abstractions.repositories.NotificationRepository;
import sba301.hrtech.notification.dtos.response.NotificationResponse;
import sba301.hrtech.notification.entities.Notification;
import sba301.hrtech.notification.entities.enums.NotificationType;
import sba301.hrtech.notification.mapper.NotificationMapper;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.notification.abstractions.cache.IRedisIdempotencyService;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;
import sba301.hrtech.notification.abstractions.cache.IRedisRateLimitService;
import sba301.hrtech.notification.abstractions.services.INotificationService;
import sba301.hrtech.notification.abstractions.services.IEmailSender;
import sba301.hrtech.notification.dtos.request.ApplicationStatusNotificationRequest;
import sba301.hrtech.notification.dtos.request.OtpNotificationRequest;

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
    public void ApplicationStatusNotificationHandler(ApplicationStatusNotificationRequest request) {
        // Gửi email: chỉ khi trạng thái có template email tương ứng
        if ("PENDING_INTERVIEW_SCHEDULE".equals(request.getNewStatus())
                || "ACCEPTED".equals(request.getNewStatus())
                || "REJECTED".equals(request.getNewStatus())) {
            try {
                emailSender
                        .sendApplicationStatusUpdateEmailAsync(
                                request.getEmail(),
                                request.getFullName(),
                                request.getJobTitle(),
                                request.getCompanyName(),
                                request.getNewStatus(),
                                request.getInterviewDateTime(),
                                request.getInterviewLocation(),
                                request.getInterviewMeetingLink(),
                                request.getNote(),
                                request.getActionLink(),
                                request.getActionLabel(),
                                request.getAcceptedStartDateTime(),
                                request.getAcceptedWorkAddress(),
                                request.getAcceptedNote()
                        )
                        .whenComplete((result, throwable) -> {
                            if (throwable != null) {
                                log.error("Failed to send {} email for application {} to {}",
                                        request.getNewStatus(),
                                        request.getApplicationId(),
                                        request.getEmail(),
                                        throwable);
                            }
                        });
            } catch (Exception e) {
                log.error("Failed to dispatch {} email for application {} to {}",
                        request.getNewStatus(),
                        request.getApplicationId(),
                        request.getEmail(),
                        e);
            }
        }

        // Gửi thông báo hệ thống và push qua SSE
        try {
            User user = userService.getUserEntityByEmail(request.getEmail());
            if (user != null) {
                String title = "";
                String content = "";
                NotificationType type = NotificationType.APPLICATION_STATUS_UPDATED;

                if ("PENDING_INTERVIEW_SCHEDULE".equals(request.getNewStatus())) {
                    title = "Lịch phỏng vấn mới";
                    content = "Bạn có lịch phỏng vấn mới cho vị trí " + request.getJobTitle();
                    type = NotificationType.INTERVIEW_SCHEDULED;
                } else if ("ACCEPTED".equals(request.getNewStatus())) {
                    title = "Hồ sơ ứng tuyển được chấp nhận";
                    content = "Chúc mừng! Hồ sơ của bạn cho vị trí " + request.getJobTitle() + " đã được chấp nhận.";
                    type = NotificationType.APPLICATION_STATUS_UPDATED;
                } else if ("REJECTED".equals(request.getNewStatus())) {
                    title = "Cập nhật hồ sơ ứng tuyển";
                    content = "Rất tiếc, hồ sơ của bạn cho vị trí " + request.getJobTitle() + " không phù hợp ở thời điểm hiện tại.";
                    type = NotificationType.APPLICATION_STATUS_UPDATED;
                } else {
                    title = "Cập nhật trạng thái ứng tuyển";
                    content = "Hồ sơ của bạn cho vị trí " + request.getJobTitle() + " đã được chuyển sang trạng thái: " + request.getNewStatus();
                    type = NotificationType.APPLICATION_STATUS_UPDATED;
                }

                createAndSendNotification(user.getId(), title, content, type, request.getApplicationId());
            }
        } catch (Exception e) {
            log.error("Failed to create and send real-time notification for application status change", e);
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
    public NotificationResponse createAndSendNotification(
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
        return notificationResponse;
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
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
