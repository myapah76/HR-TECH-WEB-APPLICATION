package sba301.hrtech.identity.abstractions.services;

import sba301.hrtech.identity.entities.RefreshToken;
import sba301.hrtech.identity.entities.User;

public interface IRefreshTokenService {
    String createRefreshToken(User user);
    RefreshToken validateRefreshToken(String token);
    String refreshAccessToken(String refreshToken);
    void revokeToken(String token);
}
