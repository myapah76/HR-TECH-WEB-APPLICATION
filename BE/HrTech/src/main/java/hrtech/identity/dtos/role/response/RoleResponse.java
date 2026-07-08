package hrtech.identity.dtos.role.response;


import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class RoleResponse {

    private UUID id;
    private String name;
    private String slug;
    private String description;
}