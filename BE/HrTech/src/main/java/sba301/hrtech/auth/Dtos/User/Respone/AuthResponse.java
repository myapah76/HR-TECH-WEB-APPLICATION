package sba301.hrtech.auth.Dtos.User.Respone;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private UserResponse userResponse;
    private String accessToken;
    private String refreshToken;
}