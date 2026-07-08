package hrtech.identity.abstractions.services;

import hrtech.identity.entities.RefreshToken;
import hrtech.identity.entities.User;

public interface IRefreshTokenService {
    String createRefreshToken(User user);
    RefreshToken validateRefreshToken(String token);
    void revokeToken(String token);
    void revokeAllUserTokens(User user);
}
