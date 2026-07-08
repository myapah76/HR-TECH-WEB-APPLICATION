package hrtech.company.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateMemberRoleRequest(
        @NotBlank(message = "Role is required") String role) {
}
