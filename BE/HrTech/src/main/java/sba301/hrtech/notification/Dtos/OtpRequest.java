package sba301.hrtech.notification.Dtos;

public record OtpRequest(
        String email,
        String otp
) {}