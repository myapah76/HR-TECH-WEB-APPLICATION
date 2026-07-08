package hrtech.identity.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hrtech.identity.dtos.auth.request.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import hrtech.identity.abstractions.cache.IRedisTokenService;
import hrtech.identity.abstractions.repositories.RoleRepository;
import hrtech.identity.abstractions.services.IAuthService;
import hrtech.identity.abstractions.services.IJwtService;
import hrtech.identity.abstractions.services.IRefreshTokenService;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import hrtech.identity.dtos.auth.response.EmailActionResponse;
import hrtech.identity.dtos.auth.response.ForgotPasswordResponse;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.identity.entities.RefreshToken;
import hrtech.identity.entities.Role;
import hrtech.identity.entities.User;
import hrtech.identity.dtos.auth.PendingUser;
import hrtech.identity.dtos.user.CustomUserDetails;
import hrtech.identity.dtos.auth.response.AuthResponse;
import hrtech.identity.dtos.auth.response.TokenPair;
import hrtech.identity.mapper.UserMapper;
import hrtech.identity.services.cache.OtpAttemptTracker;
import hrtech.notification.abstractions.services.INotificationService;
import hrtech.notification.abstractions.cache.IRedisOtpService;
import hrtech.shared.enums.OtpType;
import hrtech.notification.dtos.request.OtpNotificationRequest;
import hrtech.notification.dtos.request.OtpRequest;
import hrtech.subscription.abstractions.services.ISubscriptionService;
import hrtech.company.abstractions.services.ICompanyService;
import org.springframework.context.annotation.Lazy;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final IUserService userService;
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
    private final @Lazy ICompanyService companyService;

    @Override
    @Transactional
    public EmailActionResponse register(RegisterRequest request) {

        String key = OtpType.REGISTER + request.email();
        // 1. generate OTP
        String otp = generateOtp();

        if (userService.existsByEmail(request.email())) {
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
        saveToRedis(key, pendingUser, Duration.ofMinutes(5));

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
        if (!userService.existsByEmail(request.email())) {
            throw new AppException(ErrorCode.EMAIL_NOT_FOUND, "Email not found");
        }

        User user = userService.getUserEntityByEmail(request.email());
        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new AppException(ErrorCode.USER_ALREADY_REGISTERED, "User is blocked");
        }

        String key = OtpType.FORGET_PASSWORD + request.email();
        String otp = generateOtp();

        saveToRedis(key, otp, Duration.ofMinutes(5));

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
                        request.type()));

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

        User user = userService.getUserEntityByEmail(email);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userService.saveUserEntity(user);
        redisTemplate.delete(key);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Confirm password does not match new password");
        }

        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        User user = userService.getUserEntityById(userDetails.user().getId());

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setRequirePasswordChange(false);
        userService.saveUserEntity(user);
    }

    @Override
    @Transactional
    public ConfirmOtpResult confirmOtp(ConfirmOtpRequest request) {

        String email = request.email();

        validateOtpOrThrow(request.type().toString(), email, request.otp());

        return switch (request.type()) {

            case REGISTER -> confirmRegisterOtp(email);

            case FORGET_PASSWORD -> confirmForgotPasswordOtp(email);

            case REGISTER_COMPANY -> companyService.confirmRegisterOtp(email);

            default -> throw new IllegalStateException("Unexpected value: " + request.type());
        };
    }

    @Override
    public TokenPair login(LoginRequest request) {

        User user = userService.getUserEntityByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }
        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new AppException(ErrorCode.USER_IS_BLOCKED, "User is blocked");
        }
        if (user.getRequirePasswordChange() != null && user.getRequirePasswordChange()) {
            String setupToken = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set("setup_pwd:" + setupToken, user.getId().toString(), Duration.ofMinutes(15));

            AuthResponse authResponse = AuthResponse.builder()
                    .needsPasswordSetup(true)
                    .setupToken(setupToken)
                    .build();
            return new TokenPair(authResponse, null);
        }
        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);

        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenPair(
                new AuthResponse(userMapper.toResponse(user), accessToken, refreshToken),
                refreshToken);
    }

    @Override
    public TokenPair refresh(String request) {
        // 1. Validate
        RefreshToken oldRefreshToken = refreshTokenService.validateRefreshToken(request);

        // 2. Revoke the old token (Token Rotation)
        refreshTokenService.revokeToken(request);

        // 3. Generate new tokens
        User user = oldRefreshToken.getUser();
        String newAccessToken = jwtService.generateToken(new CustomUserDetails(user));
        String newRefreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenPair(
                new AuthResponse(userMapper.toResponse(user), newAccessToken, newRefreshToken),
                newRefreshToken);
    }

    @Override
    public TokenPair googleLogin(GoogleLoginRequest request) {
        String token = request.getToken();
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        ResponseEntity<Map<String, Object>> response;
        try {
            response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo", 
                    HttpMethod.GET, 
                    entity, 
                    new ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Invalid Google token");
        }

        Map<String, Object> userInfo = response.getBody();
        if (userInfo == null || !userInfo.containsKey("email")) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Invalid Google token");
        }

        String email = (String) userInfo.get("email");
        String firstName = (String) userInfo.get("given_name");
        String lastName = (String) userInfo.get("family_name");
        String picture = (String) userInfo.get("picture");

        User user;
        if (!userService.existsByEmail(email)) {
            user = new User();
            user.setEmail(email);
            user.setUsername(email.split("@")[0]);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setAvatarUrl(picture);
            // generate random strong password
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRequirePasswordChange(true);

            Role role = roleRepository.findByName("CANDIDATE")
                    .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR, "Role CANDIDATE not found"));
            user.setRole(role);
            user = userService.saveUserEntity(user);

            // Tự động tạo và kích hoạt gói Free cho candidate mới đăng ký qua Google
            subscriptionService.createAndActivateFreeSubscription(user.getId());
        } else {
            user = userService.getUserEntityByEmail(email);
        }

        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new AppException(ErrorCode.USER_ALREADY_REGISTERED, "User is blocked");
        }

        if (user.getRequirePasswordChange() != null && user.getRequirePasswordChange()) {
            String setupToken = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set("setup_pwd:" + setupToken, user.getId().toString(), Duration.ofMinutes(15));

            AuthResponse authResponse = AuthResponse.builder()
                    .needsPasswordSetup(true)
                    .setupToken(setupToken)
                    .build();
            return new TokenPair(authResponse, null);
        }

        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenPair(
                new AuthResponse(userMapper.toResponse(user), accessToken, refreshToken), refreshToken);
    }

    @Override
    public TokenPair setupPassword(SetupPasswordRequest request) {
        String key = "setup_pwd:" + request.getSetupToken();
        String userIdStr = (String) redisTemplate.opsForValue().get(key);

        if (userIdStr == null) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Setup token expired or invalid");
        }

        User user = userService.getUserEntityById(UUID.fromString(userIdStr));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setRequirePasswordChange(false);
        userService.saveUserEntity(user);

        redisTemplate.delete(key);

        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new TokenPair(
                new AuthResponse(userMapper.toResponse(user), accessToken, refreshToken), refreshToken);
    }

    @Override
    public void logout(String refreshToken) {
        try {
            String jti = jwtService.extractJwtId(refreshToken);
            long ttl = getRemainingTime(refreshToken);

            if (ttl > 0) {
                redisTokenService.blacklistToken(jti, ttl);
            }
            refreshTokenService.revokeToken(refreshToken);
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
            Class<T> clazz) {
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

        boolean valid = otpService.validateOtp(type, email, otp);

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

    private ConfirmOtpResult confirmRegisterOtp(String email) {

        String key = OtpType.REGISTER + email;

        PendingUser pendingUser = getFromRedis(key, PendingUser.class);

        User user = new User();
        user.setEmail(pendingUser.email());
        user.setUsername(pendingUser.username());
        user.setFirstName(pendingUser.firstName());
        user.setLastName(pendingUser.lastName());
        user.setPassword(passwordEncoder.encode(pendingUser.password()));
        user.setGender(pendingUser.gender());

        String requestedRole = pendingUser.role();
        if (requestedRole == null
                || (!requestedRole.equalsIgnoreCase("RECRUITER") && !requestedRole.equalsIgnoreCase("CANDIDATE"))) {
            requestedRole = "CANDIDATE";
        }
        Role role = roleRepository.findByName(requestedRole.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND, "Role not found"));

        user.setRole(role);
        userService.saveUserEntity(user);

        // Tự động tạo và kích hoạt gói Free cho candidate mới đăng ký
        if ("CANDIDATE".equalsIgnoreCase(requestedRole)) {
            subscriptionService.createAndActivateFreeSubscription(user.getId());
        }

        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);

        return new ConfirmOtpResult(
                OtpType.REGISTER.toString(),
                userMapper.toResponse(user));
    }

    private ConfirmOtpResult confirmForgotPasswordOtp(
            String email) {

        String key = OtpType.FORGET_PASSWORD + email;

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                "reset:" + resetToken,
                email,
                Duration.ofMinutes(5));

        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);

        return new ConfirmOtpResult(
                OtpType.REGISTER.toString(),
                new ForgotPasswordResponse(email, true, "OTP verified. You can now reset your password", resetToken));
    }
}
