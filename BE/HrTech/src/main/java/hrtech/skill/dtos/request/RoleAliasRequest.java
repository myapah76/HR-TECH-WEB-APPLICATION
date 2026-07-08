package hrtech.skill.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleAliasRequest {
    @NotBlank(message = "Alias is required")
    private String alias;

    @NotBlank(message = "Canonical role is required")
    private String canonicalRole;
}
