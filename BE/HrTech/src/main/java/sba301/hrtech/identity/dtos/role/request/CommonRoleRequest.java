package sba301.hrtech.identity.dtos.role.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommonRoleRequest {
    @NotNull
    private String name;
    @NotNull
    private String description;
}
