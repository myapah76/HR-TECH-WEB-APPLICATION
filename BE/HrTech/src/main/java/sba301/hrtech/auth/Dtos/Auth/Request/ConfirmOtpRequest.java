package sba301.hrtech.auth.dtos.auth.request;

public record ConfirmOtpRequest(
        String email,
        String otp
) {}