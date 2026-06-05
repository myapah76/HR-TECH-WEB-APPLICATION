package sba301.hrtech.auth.dtos.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import sba301.hrtech.shared.enums.OtpType;

public record ResendOtpRequest(
        @Email
        @NotNull
        String email,
        @NotNull
        OtpType type
) {
}
