package sba301.hrtech.auth.Dtos.User.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
@Getter
@Setter
public class UserCommonRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String username;

    private String phone;

    private String address;

    @NotNull(message = "Gender is required")
    private Integer gender; // 0: Male, 1: Female

    @NotNull(message = "Date of birth is required")
    private OffsetDateTime dateOfBirth;

    private Boolean isBlocked;

    private String avatarUrl;

    private String avatarPublicId;
    
    private String roleId; // nhận từ client (UUID dạng string)
}
