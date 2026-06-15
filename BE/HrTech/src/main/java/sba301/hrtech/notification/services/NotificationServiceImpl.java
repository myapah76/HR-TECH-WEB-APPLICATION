package sba301.hrtech.notification.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.notification.abstractions.cache.IRedisIdempotencyService;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;
import sba301.hrtech.notification.abstractions.cache.IRedisRateLimitService;
import sba301.hrtech.notification.abstractions.INotificationService;
import sba301.hrtech.notification.abstractions.IEmailSender;
import sba301.hrtech.notification.dtos.OtpNotificationRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements INotificationService {

    private final IRedisOtpService otpService;
    private final IRedisRateLimitService rateLimitService;
    private final IRedisIdempotencyService idempotencyService;
    private final IEmailSender emailSender;

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
}
