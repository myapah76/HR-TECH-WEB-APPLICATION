package sba301.hrtech.notification.dtos;

public record ResetPasswordRequest(
        String email,
        String link
) {}