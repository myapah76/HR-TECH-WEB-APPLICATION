package hrtech.identity.dtos.auth.request;

public record ResetPasswordRequest(
        String resetToken,
        String newPassword
) {
}
