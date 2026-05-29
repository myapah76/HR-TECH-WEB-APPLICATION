package sba301.hrtech.notification.dtos;

public record OtpRequest(
        String email,
        String otp
) {}