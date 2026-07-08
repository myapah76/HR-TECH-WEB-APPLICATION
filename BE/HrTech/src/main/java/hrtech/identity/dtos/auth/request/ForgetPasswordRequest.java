package hrtech.identity.dtos.auth.request;

import jakarta.validation.constraints.Email;

public record ForgetPasswordRequest(
        @Email
        String email
) {}
