package sba301.hrtech.auth.Dtos.Auth.Request;

public record ConfirmOtpRequest(
        String email,
        String otp
) {}