package sba301.hrtech.auth.Services.Cache;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import sba301.hrtech.auth.Abstrations.Repositories.RefreshTokenRepository;
import sba301.hrtech.auth.Domain.Entities.RefreshToken;
import sba301.hrtech.auth.Domain.Entities.User;
import sba301.hrtech.auth.Domain.Exceptions.Token.InvalidTokenException;
import sba301.hrtech.auth.Domain.Exceptions.Token.TokenExpiredException;
import sba301.hrtech.auth.Domain.Exceptions.Token.TokenRevokedException;
import sba301.hrtech.auth.Dtos.User.CustomUserDetails;
import sba301.hrtech.auth.Services.JwtService;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements sba301.hrtech.auth.Abstrations.Service.RefreshTokenService {

    private final RefreshTokenRepository IRefreshTokenRepository;
    private final JwtService jwtService;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenDays;
    @Override
    public String createRefreshToken(User user) {
        RefreshToken token = new RefreshToken();

        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(OffsetDateTime.now().plusDays(refreshTokenDays));
        token.setIsRevoked(false);

        IRefreshTokenRepository.save(token);

        return token.getToken();
    }
    @Override
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = IRefreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (Boolean.TRUE.equals(refreshToken.getIsRevoked())) {
            throw new TokenRevokedException("Refresh token revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new TokenExpiredException("Refresh token expired");
        }

        return refreshToken;
    }
    @Override
    public String refreshAccessToken(String refreshTokenStr) {

        RefreshToken refreshToken = validateRefreshToken(refreshTokenStr);

        // revoke token cũ
        refreshToken.setIsRevoked(true);
        IRefreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        // tạo token mới
        UserDetails userDetails = new CustomUserDetails(user);
        return jwtService.generateToken(userDetails);
    }
    @Override
    public void revokeToken(String token) {
        RefreshToken refreshToken = IRefreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        if (refreshToken.getIsRevoked()) {
            return;
        }
        refreshToken.setIsRevoked(true);
        IRefreshTokenRepository.save(refreshToken);
    }
}