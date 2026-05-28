package sba301.hrtech.notification.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sba301.hrtech.notification.Abstractions.Cache.RedisIdempotencyService;
import sba301.hrtech.notification.Abstractions.Cache.RedisOtpService;
import sba301.hrtech.notification.Abstractions.Cache.RedisRateLimitService;
import sba301.hrtech.notification.Dtos.OtpNotificationRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService implements sba301.hrtech.notification.Abstractions.NotificationService {

    private final RedisOtpService otpService;
    private final RedisRateLimitService rateLimitService;
    private final RedisIdempotencyService idempotencyService;
    private final EmailSender emailSender;

    @Override
    public void OtpNotificationHandler(OtpNotificationRequest request) {

        //IDENTITY CHECK
        if (idempotencyService.isProcessed(request.getId())) {
            return;
        }

        //RATE LIMIT CHECK
        if (!rateLimitService.isAllowed(request.getOtpRequest().email())) {
            log.warn("Rate limit hit for email {}", request.getOtpRequest().email());
            return; // NOT throw
        }

        if(!otpService.saveOtp(request.getOtpRequest().email(), request.getOtpRequest().otp())){
            throw new RuntimeException("Fail to save otp code with email: " + request.getOtpRequest().email());
        }

        //SEND EMAIL
        emailSender.sendOtpEmailAsync(request.getOtpRequest().email(), request.getOtpRequest().otp());

        //MARK AS PROCESSED
        idempotencyService.markProcessed(request.getId());
    }
}
