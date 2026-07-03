package sba301.hrtech.notification.dtos.request;

public record OtpRequest(
        String email,
        String otp
) {}