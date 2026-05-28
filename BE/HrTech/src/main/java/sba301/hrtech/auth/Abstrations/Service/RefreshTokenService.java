package sba301.hrtech.auth.Abstrations.Service;

import sba301.hrtech.auth.Domain.Entities.RefreshToken;
import sba301.hrtech.auth.Domain.Entities.User;

public interface RefreshTokenService {
    String createRefreshToken(User user);
    RefreshToken validateRefreshToken(String token);
    String refreshAccessToken(String refreshToken);
    void revokeToken(String token);
}
