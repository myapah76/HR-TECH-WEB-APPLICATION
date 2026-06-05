package sba301.hrtech.auth.dtos.auth.request;

import jakarta.validation.constraints.Email;
import sba301.hrtech.shared.enums.OtpType;

public record ConfirmOtpRequest(
        @Email
        String email,
        String otp,
        OtpType type
) {}