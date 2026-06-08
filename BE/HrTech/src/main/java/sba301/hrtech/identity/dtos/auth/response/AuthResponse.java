package sba301.hrtech.identity.dtos.auth.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.identity.dtos.user.response.UserResponse;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private UserResponse userResponse;
    private String accessToken;
    private String refreshToken;
}