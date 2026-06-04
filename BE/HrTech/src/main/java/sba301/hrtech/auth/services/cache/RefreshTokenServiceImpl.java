package sba301.hrtech.auth.services.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import sba301.hrtech.auth.abstractions.repositories.RefreshTokenRepository;
import sba301.hrtech.auth.abstractions.services.IRefreshTokenService;
import sba301.hrtech.auth.entities.RefreshToken;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.exceptions.token.InvalidTokenException;
import sba301.hrtech.auth.exceptions.token.TokenExpiredException;
import sba301.hrtech.auth.exceptions.token.TokenRevokedException;
import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.auth.services.JwtServiceImpl;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements IRefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtServiceImpl jwtService;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenDays;

    @Override
    public String createRefreshToken(User user) {
        RefreshToken token = new RefreshToken();

        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS));
        token.setIsRevoked(false);

        refreshTokenRepository.save(token);

        return token.getToken();
    }

    @Override
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (Boolean.TRUE.equals(refreshToken.getIsRevoked())) {
            throw new TokenRevokedException("Refresh token revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException("Refresh token expired");
        }

        return refreshToken;
    }

    @Override
    public String refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = validateRefreshToken(refreshTokenStr);
        // revoke token cũ
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        // tạo token mới
        UserDetails userDetails = new CustomUserDetails(user);
        return jwtService.generateToken(userDetails);
    }

    @Override
    public void revokeToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        if (refreshToken.getIsRevoked()) {
            return;
        }
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
}
