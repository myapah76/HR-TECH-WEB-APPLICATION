package hrtech.identity.dtos.auth.response;

public record ForgotPasswordResponse(
        String email,
        boolean verified,
        String message,
        String resetToken
) {}
