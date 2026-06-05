package sba301.hrtech.auth.dtos.auth.request;

public record ResetPasswordRequest(
        String resetToken,
        String newPassword
) {
}
