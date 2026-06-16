package sba301.hrtech.identity.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.identity.abstractions.cache.IRedisTokenService;
import sba301.hrtech.identity.abstractions.repositories.RoleRepository;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.abstractions.services.IAuthService;
import sba301.hrtech.identity.abstractions.services.IJwtService;
import sba301.hrtech.identity.abstractions.services.IRefreshTokenService;
import sba301.hrtech.identity.dtos.auth.request.*;
import sba301.hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;
import sba301.hrtech.identity.dtos.auth.response.ForgotPasswordResponse;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.identity.entities.RefreshToken;
import sba301.hrtech.identity.entities.Role;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.dtos.auth.PendingUser;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.dtos.auth.response.AuthResponse;
import sba301.hrtech.identity.mapper.UserMapper;
import sba301.hrtech.identity.services.cache.OtpAttemptTracker;
import sba301.hrtech.identity.services.cache.RefreshTokenServiceImpl;
import sba301.hrtech.notification.abstractions.INotificationService;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;
import sba301.hrtech.shared.enums.OtpType;
import sba301.hrtech.notification.dtos.OtpNotificationRequest;
import sba301.hrtech.notification.dtos.OtpRequest;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionPlanService;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.entities.SubscriptionPlan;

import javax.management.relation.RoleNotFoundException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IJwtService jwtService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final IRefreshTokenService refreshTokenService;
    private final IRedisTokenService redisTokenService;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    private final RoleRepository roleRepository;
    private final INotificationService notificationService;
    private final IRedisOtpService otpService;
    private final OtpAttemptTracker otpAttemptTracker;
    private final ISubscriptionService subscriptionService;
    private final ISubscriptionPlanService subscriptionPlanService;

    @Override
    @Transactional
    public EmailActionResponse register(RegisterRequest request) {

        String key = OtpType.REGISTER + request.email();
        // 1. generate OTP
        String otp = generateOtp();

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED);
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
                false,
                request.role());
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
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));
        if (user.getIsBlocked()) {
            throw new AppException(ErrorCode.USER_ALREADY_REGISTERED, "User is blocked");
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
    public EmailActionResponse reSendOtp(ResendOtpRequest request) {
        String otp = generateOtp();

        notificationService.OtpNotificationHandler(
                new OtpNotificationRequest(
                        new OtpRequest(request.email(), otp),
                        request.email() + System.currentTimeMillis(),
                        request.type()
                )
        );

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
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

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
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));
        if (user.getIsBlocked()) {
            throw new AppException(ErrorCode.USER_ALREADY_REGISTERED, "User is blocked");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
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
        String newRefreshToken = refreshTokenService.createRefreshToken(user);
        return new AuthResponse(
                userMapper.toResponse(user),
                newAccessToken,
                newRefreshToken);
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
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to save data to Redis: " + e.getMessage());
        }
    }
    private <T> T getFromRedis(
            String key,
            Class<T> clazz
    ) {
        String json = (String) redisTemplate.opsForValue().get(key);

        if (json == null) {
            throw new AppException(ErrorCode.REDIS_DATA_NOT_FOUND, "Redis data not found for key: " + key);
        }

        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to parse Redis data: " + e.getMessage());
        }
    }

    private void validateOtpOrThrow(String type, String email, String otp) {

        if (otpAttemptTracker.isLockedOut(email)) {
            long remainingTime = otpAttemptTracker.getLockoutRemainingTime(email);

            throw new AppException(ErrorCode.TOO_MANY_FAILED_ATTEMPTS, 
                    "Too many failed OTP attempts. Please try again later. Remaining time: " + remainingTime + "ms");
        }

        boolean valid = otpService.validateOtp(type,email, otp);

        if (!valid) {
            int remainingAttempts = otpAttemptTracker.recordFailedAttempt(email);

            if (remainingAttempts <= 0) {
                long lockoutTime = otpAttemptTracker.getLockoutRemainingTime(email);

                throw new AppException(ErrorCode.TOO_MANY_FAILED_ATTEMPTS,
                        "Too many failed OTP attempts. Please try again later. Remaining time: " + lockoutTime + "ms");
            }

            throw new AppException(ErrorCode.WRONG_OTP_CODE, 
                    "Invalid OTP. " + remainingAttempts + " attempts remaining.");
        }
    }

    private ConfirmOtpResult confirmRegisterOtp(String email) throws RoleNotFoundException {

        String key = OtpType.REGISTER + email;

        PendingUser pendingUser =
                getFromRedis(key, PendingUser.class);

        User user = new User();
        user.setEmail(pendingUser.email());
        user.setUsername(pendingUser.username());
        user.setFirstName(pendingUser.firstName());
        user.setLastName(pendingUser.lastName());
        user.setPassword(passwordEncoder.encode(pendingUser.password()));
        user.setGender(pendingUser.gender());

        String requestedRole = pendingUser.role();
        if (requestedRole == null || (!requestedRole.equalsIgnoreCase("RECRUITER") && !requestedRole.equalsIgnoreCase("CANDIDATE"))) {
            requestedRole = "CANDIDATE";
        }
        Role role = roleRepository.findByName(requestedRole.toUpperCase())
                .orElseThrow(RoleNotFoundException::new);

        user.setRole(role);
        userRepository.save(user);
        SubscriptionPlan  subscriptionPlan = subscriptionPlanService.findByName("Free");
        subscriptionService.createPendingSubscription(user.getId(),subscriptionPlan.getId());
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
