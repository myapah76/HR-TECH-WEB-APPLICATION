package hrtech.identity.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.identity.abstractions.repositories.UserRepository;
import hrtech.identity.abstractions.services.IRoleService;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.identity.entities.Role;
import hrtech.identity.entities.User;
import hrtech.identity.dtos.user.request.ChangePasswordRequest;
import hrtech.identity.dtos.user.request.CreateUserRequest;
import hrtech.identity.dtos.user.request.UserCommonRequest;
import hrtech.identity.dtos.user.response.UserResponse;
import hrtech.identity.mapper.UserMapper;
import hrtech.identity.utils.AuthUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements IUserService {
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String ADMIN_SYSTEM_ROLE = "ADMIN_SYSTEM";

    private final UserRepository userRepository;
    private final IRoleService roleService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthUtils authUtils;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {

        UserCommonRequest userCommonRequest = request.getUserCommonRequest();
        // 1. Check email exist
        if (userRepository.findByEmail(userCommonRequest.getEmail()).isPresent()){
            throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED);
        }

        User user = userMapper.fromCreateRequest(request);
        if (userCommonRequest.getRoleId() != null) {
            Role role = roleService.getRoleEntityById(UUID.fromString(userCommonRequest.getRoleId()));
            user.setRole(role);
        }
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }
    @Override
    public UserResponse getUserResponseById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toResponse(user);
    }
    @Override
    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAdminUsers(String role, Boolean isBlocked, String email, Pageable pageable) {
        String normalizedRole = role == null || role.isBlank() ? null : role.trim();
        String normalizedEmail = email == null || email.isBlank() ? null : email.trim();

        return userRepository.findAdminUsers(normalizedRole, isBlocked, normalizedEmail, pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse update(UserCommonRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // MapStruct handles simple field mapping
        userMapper.updateUserFromRequest(request, user);

        // Role set thủ công
        if (request.getRoleId() != null) {
            Role role = roleService.getRoleEntityById(UUID.fromString(request.getRoleId()));
            user.setRole(role);
        }

        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateBlockStatus(UUID userId, Boolean isBlocked) {
        UUID currentUserId = authUtils.getCurrentUserId();
        if (currentUserId.equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Admin cannot update their own blocked status");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String targetRole = user.getRole() != null ? user.getRole().getName() : null;
        boolean isAdminUser = ADMIN_ROLE.equals(targetRole) || ADMIN_SYSTEM_ROLE.equals(targetRole);
        if (Boolean.TRUE.equals(isBlocked) && isAdminUser) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Admin users cannot be blocked");
        }

        user.setIsBlocked(isBlocked);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse changePassword(ChangePasswordRequest request){
        User user = userRepository.findById(request.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public void deleteById(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    @Override
    public User getUserEntityById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public User saveUserEntity(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsById(UUID id) {
        return userRepository.existsById(id);
    }
}
