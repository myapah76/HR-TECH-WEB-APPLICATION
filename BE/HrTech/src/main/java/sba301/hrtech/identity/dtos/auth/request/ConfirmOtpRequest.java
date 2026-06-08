package sba301.hrtech.identity.dtos.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import sba301.hrtech.shared.enums.OtpType;

public record ConfirmOtpRequest(
        @Email
        @NotNull
        String email,
        @NotNull
        String otp,
        @NotNull
        OtpType type
) {}