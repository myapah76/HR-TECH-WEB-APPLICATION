package sba301.hrtech.identity.dtos.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetupPasswordRequest {
    @NotBlank(message = "Setup token is required")
    private String setupToken;

    @NotBlank(message = "New password is required")
    private String newPassword;
}
