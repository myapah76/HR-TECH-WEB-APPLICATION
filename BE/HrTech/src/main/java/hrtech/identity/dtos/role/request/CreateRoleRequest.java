package hrtech.identity.dtos.role.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoleRequest {
    @NotNull
    private CommonRoleRequest commonRoleRequest;
    @NotNull
    private String slug;
}
