package sba301.hrtech.identity.dtos.auth.response;

import lombok.*;
import sba301.hrtech.identity.dtos.user.response.UserResponse;
import com.fasterxml.jackson.annotation.JsonInclude;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private UserResponse userResponse;
    private String accessToken;
    private String refreshToken;
    private Boolean needsPasswordSetup;
    private String setupToken;

    public AuthResponse(UserResponse userResponse, String accessToken, String refreshToken) {
        this.userResponse = userResponse;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}