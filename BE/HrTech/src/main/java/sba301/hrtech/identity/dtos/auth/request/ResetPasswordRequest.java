package sba301.hrtech.identity.dtos.auth.request;

public record ResetPasswordRequest(
        String resetToken,
        String newPassword
) {
}
