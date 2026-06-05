package sba301.hrtech.auth.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.auth.abstractions.cache.IRedisTokenService;
import sba301.hrtech.auth.abstractions.repositories.RoleRepository;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;
import sba301.hrtech.auth.abstractions.services.IAuthService;
import sba301.hrtech.auth.dtos.auth.request.*;
import sba301.hrtech.auth.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.auth.dtos.auth.response.EmailActionResponse;
import sba301.hrtech.auth.dtos.auth.response.ForgotPasswordResponse;
import sba301.hrtech.auth.exceptions.RedisDataNotFoundException;
import sba301.hrtech.auth.exceptions.auth.OtpLockoutException;
import sba301.hrtech.auth.exceptions.auth.WrongOtpCodeException;
import sba301.hrtech.auth.exceptions.token.TokenExpiredException;
import sba301.hrtech.auth.exceptions.user.UserExistException;
import sba301.hrtech.auth.exceptions.user.UserNotFoundException;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.auth.entities.RefreshToken;
import sba301.hrtech.auth.entities.Role;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.exceptions.auth.EmailNotFoundException;
import sba301.hrtech.auth.exceptions.auth.WrongPasswordException;
import sba301.hrtech.auth.dtos.auth.PendingUser;
import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.auth.dtos.auth.response.AuthResponse;
import sba301.hrtech.auth.dtos.user.response.UserResponse;
import sba301.hrtech.auth.mapper.UserMapper;
import sba301.hrtech.auth.services.cache.OtpAttemptTracker;
import sba301.hrtech.auth.services.cache.RefreshTokenServiceImpl;
import sba301.hrtech.notification.abstractions.INotificationService;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;
import sba301.hrtech.shared.enums.OtpType;
import sba301.hrtech.notification.dtos.OtpNotificationRequest;
import sba301.hrtech.notification.dtos.OtpRequest;

import javax.management.relation.RoleNotFoundException;
import java.time.Duration;
import java.util.UUID;

import static sba301.hrtech.shared.common.ErrorCode.TOKEN_EXPIRED;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final IRedisTokenService redisTokenService;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    private final RoleRepository roleRepository;
    private final INotificationService notificationService;
    private final IRedisOtpService otpService;
    private final OtpAttemptTracker otpAttemptTracker;

    @Override
    @Transactional
    public EmailActionResponse register(RegisterRequest request) {

        String key = OtpType.REGISTER + request.email();
        // 1. generate OTP
        String otp = generateOtp();

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new UserExistException(ErrorCode.Email_Already_Registered);
        }

        // 2. create pending user object (staging in Redis)
        PendingUser pendingUser = new PendingUser(
                request.email(),
                request.username(),
                request.password(),
                request.firstName(),
                request.lastName(),
                request.gender(),
                null, // hashed otp is no longer stored in pending user
                false);
        // 3. save to Redis
        saveToRedis(key, pendingUser,Duration.ofMinutes(5));

        // 4. create OTP notification
        notificationService.OtpNotificationHandler(new OtpNotificationRequest(
                new OtpRequest(request.email(), otp),
                request.email() + otp,
                OtpType.REGISTER));

        return EmailActionResponse.builder()
                .email(request.email())
                .expireIn(5 * 60) // 5 minutes in seconds
                .build();
    }

    @Override
    public EmailActionResponse forgetPassword(ForgetPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new EmailNotFoundException(ErrorCode.Email_Not_Found));
        if (user.getIsBlocked()) {
            throw new RuntimeException("User is blocked");
        }
        String key = OtpType.FORGET_PASSWORD + request.email();
        String otp = generateOtp();

        saveToRedis(key,otp,Duration.ofMinutes(5));

        notificationService.OtpNotificationHandler(new OtpNotificationRequest(
                new OtpRequest(request.email(), otp),
                request.email() + otp,
                OtpType.FORGET_PASSWORD));

        return EmailActionResponse.builder()
                .email(request.email())
                .expireIn(5 * 60)
                .build();
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String key = "reset:" + request.resetToken();

        String email = (String) redisTemplate.opsForValue().get(key);

        if (email == null) {
            throw new TokenExpiredException("Reset token expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException(ErrorCode.Email_Not_Found));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        redisTemplate.delete(key);
    }

    @Override
    @Transactional
    public ConfirmOtpResult confirmOtp(ConfirmOtpRequest request) throws RoleNotFoundException {

        String email = request.email();

        validateOtpOrThrow(request.type().toString(),email, request.otp());

        return switch (request.type()) {

            case REGISTER -> confirmRegisterOtp(email);

            case FORGET_PASSWORD -> confirmForgotPasswordOtp(email);

            default -> throw new IllegalStateException("Unexpected value: " + request.type());
        };
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EmailNotFoundException(ErrorCode.Email_Not_Found));
        if (user.getIsBlocked()) {
            throw new RuntimeException("User is blocked");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new WrongPasswordException(ErrorCode.Wrong_Password);
        }
        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                userMapper.toResponse(user),
                accessToken,
                refreshToken);
    }

    @Override
    public AuthResponse refresh(String request) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(request);
        User user = refreshToken.getUser();
        String newAccessToken = refreshTokenService.refreshAccessToken(request);
        return new AuthResponse(
                userMapper.toResponse(user),
                newAccessToken,
                request);
    }

    @Override
    public void logout(String refreshToken) {
        try {
            String jti = jwtService.extractJwtId(refreshToken);
            long ttl = getRemainingTime(refreshToken);

            if (ttl > 0) {
                redisTokenService.blacklistToken(jti, ttl);
            }
        } catch (Exception e) {
        }
    }

    // Function Helper
    public long getRemainingTime(String token) {
        long ttl = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
        return Math.max(ttl, 0);
    }

    private String generateOtp() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }

    private void saveToRedis(String key, Object value, Duration ttl) {
        try {
            if (redisTemplate.hasKey(key)) {
                redisTemplate.delete(key);
            }

            redisTemplate.opsForValue()
                    .set(key, objectMapper.writeValueAsString(value), ttl);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to save data to Redis", e);
        }
    }
    private <T> T getFromRedis(
            String key,
            Class<T> clazz
    ) {
        String json = (String) redisTemplate.opsForValue().get(key);

        if (json == null) {
            throw new RedisDataNotFoundException(key);
        }

        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private void validateOtpOrThrow(String type, String email, String otp) {

        if (otpAttemptTracker.isLockedOut(email)) {
            long remainingTime = otpAttemptTracker.getLockoutRemainingTime(email);

            throw new OtpLockoutException(
                    "Too many failed OTP attempts. Please try again later.",
                    remainingTime
            );
        }

        boolean valid = otpService.validateOtp(type,email, otp);

        if (!valid) {
            int remainingAttempts = otpAttemptTracker.recordFailedAttempt(email);

            if (remainingAttempts <= 0) {
                long lockoutTime = otpAttemptTracker.getLockoutRemainingTime(email);

                throw new OtpLockoutException(
                        "Too many failed OTP attempts. Please try again later.",
                        lockoutTime
                );
            }

            throw new WrongOtpCodeException(
                    "Invalid OTP. " + remainingAttempts + " attempts remaining."
            );
        }
    }

    private ConfirmOtpResult confirmRegisterOtp(String email) throws RoleNotFoundException {

        String key = OtpType.REGISTER + email;

        PendingUser pendingUser =
                getFromRedis(key, PendingUser.class);

        User user = new User();

        user.setEmail(pendingUser.email());
        user.setUsername(pendingUser.username());
        user.setPassword(passwordEncoder.encode(pendingUser.password()));
        user.setGender(pendingUser.gender());

        Role role = roleRepository.findByName("CANDIDATE")
                .orElseThrow(RoleNotFoundException::new);

        user.setRole(role);

        userRepository.save(user);

        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);

        return new ConfirmOtpResult(
                OtpType.REGISTER.toString(),
                userMapper.toResponse(user)
        );
    }

    private ConfirmOtpResult confirmForgotPasswordOtp(
            String email
    ) {

        String key = OtpType.FORGET_PASSWORD + email;

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                "reset:" + resetToken,
                email,
                Duration.ofMinutes(5)
        );

        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);

        return new ConfirmOtpResult(
                OtpType.REGISTER.toString(),
                new ForgotPasswordResponse(email, true,"OTP verified. You can now reset your password",resetToken)
        );
    }
}
