package sba301.hrtech.auth.abstractions.services;

import sba301.hrtech.auth.entities.RefreshToken;
import sba301.hrtech.auth.entities.User;

public interface IRefreshTokenService {
    String createRefreshToken(User user);
    RefreshToken validateRefreshToken(String token);
    String refreshAccessToken(String refreshToken);
    void revokeToken(String token);
}
