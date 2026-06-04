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
import sba301.hrtech.auth.dtos.auth.request.LoginRequest;
import sba301.hrtech.auth.dtos.auth.request.RefreshRequest;
import sba301.hrtech.auth.dtos.auth.response.RegisterResponse;
import sba301.hrtech.auth.dtos.auth.response.TokenResponse;
import sba301.hrtech.auth.exceptions.user.UserExistException;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.auth.entities.RefreshToken;
import sba301.hrtech.auth.entities.Role;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.exceptions.auth.EmailNotFoundException;
import sba301.hrtech.auth.exceptions.auth.OtpLockoutException;
import sba301.hrtech.auth.exceptions.auth.WrongOtpCodeException;
import sba301.hrtech.auth.exceptions.auth.WrongPasswordException;
import sba301.hrtech.auth.dtos.auth.PendingUser;
import sba301.hrtech.auth.dtos.auth.request.ConfirmOtpRequest;
import sba301.hrtech.auth.dtos.auth.request.RegisterRequest;
import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.auth.dtos.auth.response.AuthResponse;
import sba301.hrtech.auth.dtos.user.response.UserResponse;
import sba301.hrtech.auth.mapper.UserMapper;
import sba301.hrtech.auth.services.cache.OtpAttemptTracker;
import sba301.hrtech.auth.services.cache.RefreshTokenServiceImpl;
import sba301.hrtech.notification.abstractions.INotificationService;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;
import sba301.hrtech.notification.dtos.enums.OtpType;
import sba301.hrtech.notification.dtos.OtpNotificationRequest;
import sba301.hrtech.notification.dtos.OtpRequest;

import java.time.Duration;
import java.time.Instant;

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
    public RegisterResponse register(RegisterRequest request) {

        String key = "PENDING_USER:" + request.email();
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
                false
        );
        // 3. save to Redis
        try {
            if (redisTemplate.hasKey(key)) {
                redisTemplate.delete(key);
            }

            redisTemplate.opsForValue()
                    .set(key, objectMapper.writeValueAsString(pendingUser), Duration.ofMinutes(1));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        
        // 4. create OTP notification
        notificationService.OtpNotificationHandler(new OtpNotificationRequest(
                new OtpRequest(request.email(), otp),
                request.email()+ otp,
                OtpType.REGISTER
        ));

        return RegisterResponse.builder()
                .email(request.email())
                .expireIn(5 * 60) // 5 minutes in seconds
                .build();
    }

    @Override
    @Transactional
    public UserResponse confirmOtp(ConfirmOtpRequest request) {

        String email = request.email();

        // 1. Check if email is locked out
        if (otpAttemptTracker.isLockedOut(email)) {
            long remainingTime = otpAttemptTracker.getLockoutRemainingTime(email);
            throw new OtpLockoutException(
                    "Too many failed OTP attempts. Please try again later.",
                    remainingTime
            );
        }

        String key = "PENDING_USER:" + email;
        String json = (String) redisTemplate.opsForValue().get(key);

        PendingUser pendingUser = null;
        try {
            pendingUser = objectMapper.readValue(json, PendingUser.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        if (pendingUser == null) {
            throw new RuntimeException(ErrorCode.Pending_User_Not_Found);
        }

        // 2. Validate OTP using Lua script
        if (request.otp() == null || !otpService.validateOtp(email, request.otp())) {
            int remainingAttempts = otpAttemptTracker.recordFailedAttempt(email);
            
            if (remainingAttempts <= 0) {
                long lockoutTime = otpAttemptTracker.getLockoutRemainingTime(email);
                throw new OtpLockoutException(
                        "Too many failed OTP attempts. Please try again later.",
                        lockoutTime
                );
            }
            throw new WrongOtpCodeException("Invalid OTP. " + remainingAttempts + " attempts remaining.");
        }

        // 3. Create user
        User user = new User();
        user.setEmail(pendingUser.email());
        user.setUsername(pendingUser.username());
        user.setPassword(passwordEncoder.encode(pendingUser.password()));
        user.setGender(pendingUser.gender());
        user.setFirstName(pendingUser.firstName() != null ? pendingUser.firstName() : "Unknown");
        user.setLastName(pendingUser.lastName() != null ? pendingUser.lastName() : "Unknown");

        Role role = roleRepository.findByName("CANDIDATE")
                .orElseThrow(() -> new RuntimeException(ErrorCode.Role_Not_Found));
        user.setRole(role);
        user.setCreatedAt(Instant.now());

        userRepository.save(user);
        
        // 4. Cleanup: delete pending user and reset OTP attempts
        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);
        
        return userMapper.toResponse(user);
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
                refreshToken
        );
    }
    @Override
    public AuthResponse refresh(String request) {
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(request);
        User user = refreshToken.getUser();
        String newAccessToken = refreshTokenService.refreshAccessToken(request);
        return new AuthResponse(
                userMapper.toResponse(user),
                newAccessToken,
                request
        );
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
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }
}

