package sba301.hrtech.auth.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.auth.abstractions.repositories.RoleRepository;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;
import sba301.hrtech.auth.abstractions.services.IUserService;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.auth.entities.Role;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.exceptions.auth.WrongPasswordException;
import sba301.hrtech.auth.exceptions.user.UserExistException;
import sba301.hrtech.auth.exceptions.user.UserNotFoundException;
import sba301.hrtech.auth.dtos.user.request.ChangePasswordRequest;
import sba301.hrtech.auth.dtos.user.request.CreateUserRequest;
import sba301.hrtech.auth.dtos.user.request.UserCommonRequest;
import sba301.hrtech.auth.dtos.user.respone.UserResponse;
import sba301.hrtech.auth.mapper.UserMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {

        UserCommonRequest userCommonRequest = request.getUserCommonRequest();
        // 1. Check email exist
        if (userRepository.findByEmail(userCommonRequest.getEmail()).isPresent()){
            throw new UserExistException(ErrorCode.Email_Already_Registered);
        }

        User user = userMapper.fromCreateRequest(request);
        if (userCommonRequest.getRoleId() != null) {
            Role role = roleRepository.findById(UUID.fromString(userCommonRequest.getRoleId()))
                    .orElseThrow(() -> new RuntimeException(ErrorCode.Role_Not_Found));
            user.setRole(role);
        }
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }
    @Override
    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.User_Not_Found));

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
    @Transactional
    public UserResponse update(UserCommonRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.User_Not_Found));

        // MapStruct handles simple field mapping
        userMapper.updateUserFromRequest(request, user);

        // Role set thủ công
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(UUID.fromString(request.getRoleId()))
                    .orElseThrow(() -> new RuntimeException(ErrorCode.Role_Not_Found));
            user.setRole(role);
        }

        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse changePassword(ChangePasswordRequest request){
        User user = userRepository.findById(request.getId())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.User_Not_Found));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new WrongPasswordException(ErrorCode.Wrong_Password);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public void deleteById(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(ErrorCode.User_Not_Found);
        }
        userRepository.deleteById(id);
    }
}
