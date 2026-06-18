package sba301.hrtech.company.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record AddMemberRequest(
                @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,

                @NotBlank(message = "Full name is required") String fullName,

                @NotBlank(message = "Role is required") String role) {
}
