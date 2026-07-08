package hrtech.identity.dtos.user.response;

import lombok.Getter;
import lombok.Setter;
import hrtech.identity.dtos.role.response.RoleResponse;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class UserResponse {

    private UUID id;

    private String firstName;
    private String lastName;
    private String email;
    private String username;

    private String phone;
    private String address;
    private Integer gender;

    private Instant dateOfBirth;

    private Boolean isBlocked;
    
    private Boolean requirePasswordChange;

    private String avatarUrl;

    private Instant createdAt;
    private Instant updatedAt;

    private RoleResponse roleResponse;
}
