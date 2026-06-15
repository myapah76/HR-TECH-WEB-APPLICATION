package sba301.hrtech.identity.services.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import sba301.hrtech.identity.abstractions.repositories.RefreshTokenRepository;
import sba301.hrtech.identity.abstractions.services.IRefreshTokenService;
import sba301.hrtech.identity.entities.RefreshToken;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.services.JwtServiceImpl;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

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
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID,"Invalid refresh token"));

        if (Boolean.TRUE.equals(refreshToken.getIsRevoked())) {
            throw new AppException(ErrorCode.TOKEN_REVOKED,"Refresh token revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED,"Refresh token expired");
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
