package sba301.hrtech.auth;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import sba301.hrtech.auth.abstractions.cache.IRedisTokenService;
import sba301.hrtech.auth.abstractions.repositories.RoleRepository;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;
import sba301.hrtech.auth.dtos.auth.request.LoginRequest;
import sba301.hrtech.auth.dtos.user.respone.AuthResponse;
import sba301.hrtech.auth.dtos.user.respone.UserResponse;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.exceptions.auth.EmailNotFoundException;
import sba301.hrtech.auth.exceptions.auth.WrongPasswordException;
import sba301.hrtech.auth.mapper.UserMapper;
import sba301.hrtech.auth.services.AuthServiceImpl;
import sba301.hrtech.auth.services.JwtServiceImpl;
import sba301.hrtech.notification.abstractions.INotificationService;
import sba301.hrtech.notification.abstractions.cache.IRedisOtpService;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
public @ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtServiceImpl jwtService;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private sba301.hrtech.auth.services.cache.RefreshTokenServiceImpl refreshTokenService;

    @Mock
    private IRedisTokenService redisTokenService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private INotificationService notificationService;

    @Mock
    private IRedisOtpService otpService;

    @Mock
    private sba301.hrtech.auth.services.cache.OtpAttemptTracker otpAttemptTracker;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void login_Success() {

        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("123456");

        User user = new User();
        user.setEmail("test@gmail.com");
        user.setPassword("encodedPassword");
        user.setIsBlocked(false);

        UserResponse userResponse = new UserResponse();
        userResponse.setEmail("test@gmail.com");
        userResponse.setUsername("testuser");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("123456", "encodedPassword"))
                .thenReturn(true);

        when(jwtService.generateToken(any()))
                .thenReturn("access-token");

        when(refreshTokenService.createRefreshToken(user))
                .thenReturn("refresh-token");

        when(userMapper.toResponse(user))
                .thenReturn(userResponse);

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());

        verify(userRepository).findByEmail("test@gmail.com");
    }

    @Test
    void login_WrongPassword() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("wrong");

        User user = new User();
        user.setEmail("test@gmail.com");
        user.setPassword("encodedPassword");
        user.setIsBlocked(false);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("wrong", "encodedPassword"))
                .thenReturn(false);

        assertThrows(
                WrongPasswordException.class,
                () -> authService.login(request)
        );
    }

    @Test
    void login_EmailNotFound() {

        LoginRequest request = new LoginRequest();
        request.setEmail("abc@gmail.com");

        when(userRepository.findByEmail("abc@gmail.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                EmailNotFoundException.class,
                () -> authService.login(request)
        );
    }
    @Test
    void login_UserBlocked() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");

        User user = new User();
        user.setIsBlocked(true);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        assertThrows(
                RuntimeException.class,
                () -> authService.login(request)
        );
    }
}
