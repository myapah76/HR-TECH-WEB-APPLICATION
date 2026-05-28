package sba301.hrtech.notification.Dtos;

public record ResetPasswordRequest(
        String email,
        String link
) {}