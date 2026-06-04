package sba301.hrtech.company.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(
        @NotNull(message = "User ID is required")
        String userId,

        @NotBlank(message = "Role is required")
        String role
) {}

