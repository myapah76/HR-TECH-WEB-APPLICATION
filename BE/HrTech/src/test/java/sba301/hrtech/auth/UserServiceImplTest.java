package sba301.hrtech.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sba301.hrtech.auth.abstractions.repositories.RoleRepository;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;
import sba301.hrtech.auth.dtos.user.request.ChangePasswordRequest;
import sba301.hrtech.auth.dtos.user.request.CreateUserRequest;
import sba301.hrtech.auth.dtos.user.request.UserCommonRequest;
import sba301.hrtech.auth.dtos.user.respone.UserResponse;
import sba301.hrtech.auth.entities.Role;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.exceptions.user.UserExistException;
import sba301.hrtech.auth.mapper.UserMapper;
import sba301.hrtech.auth.services.UserServiceImpl;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private CreateUserRequest request;
    private User user;
    private UserResponse response;

    @BeforeEach
    void setUp() {

        UserCommonRequest common = new UserCommonRequest();
        common.setEmail("test@gmail.com");

        request = new CreateUserRequest();
        request.setUserCommonRequest(common);

        user = new User();
        response = new UserResponse();
    }

    @Test
    void createUser_Success() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        when(userMapper.fromCreateRequest(request))
                .thenReturn(user);

        when(userRepository.save(user))
                .thenReturn(user);

        when(userMapper.toResponse(user))
                .thenReturn(response);

        UserResponse result = userService.createUser(request);

        assertNotNull(result);

        verify(userRepository).findByEmail("test@gmail.com");
        verify(userRepository).save(user);
    }
    @Test
    void createUser_EmailExists_ThrowException() {

        User existedUser = new User();

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(existedUser));

        assertThrows(
                UserExistException.class,
                () -> userService.createUser(request)
        );

        verify(userRepository, never()).save(any());
    }
    @Test
    void getById_Success() {

        UUID id = UUID.randomUUID();

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        when(userMapper.toResponse(user))
                .thenReturn(response);

        UserResponse result = userService.getById(id);

        assertNotNull(result);

        verify(userRepository).findById(id);
    }
    @Test
    void changePassword_Success() {

        UUID id = UUID.randomUUID();

        ChangePasswordRequest request =
                new ChangePasswordRequest();

        request.setId(id);
        request.setOldPassword("old");
        request.setNewPassword("new");

        user.setPassword("encodedOld");

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("old", "encodedOld"))
                .thenReturn(true);

        when(passwordEncoder.encode("new"))
                .thenReturn("encodedNew");

        when(userMapper.toResponse(user))
                .thenReturn(response);

        UserResponse result = userService.changePassword(request);

        assertNotNull(result);
        assertEquals("encodedNew", user.getPassword());

        verify(userRepository).save(user);
    }
}