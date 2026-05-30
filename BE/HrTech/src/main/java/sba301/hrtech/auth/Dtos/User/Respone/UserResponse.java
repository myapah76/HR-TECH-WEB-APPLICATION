package sba301.hrtech.auth.dtos.user.respone;

import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.auth.dtos.role.response.RoleResponse;

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

    private String avatarUrl;

    private Instant createdAt;
    private Instant updatedAt;

    private RoleResponse roleResponse;
}
