package sba301.hrtech.auth.dtos.auth.response;

public record ForgotPasswordResponse(
        String email,
        boolean verified,
        String message,
        String resetToken
) {}
