package sba301.hrtech.auth.Services;



import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.auth.Abstrations.Repositories.RoleRepository;
import sba301.hrtech.auth.Abstrations.Repositories.UserRepository;
import sba301.hrtech.auth.Domain.Common.ErrorCode;
import sba301.hrtech.auth.Domain.Entities.Role;
import sba301.hrtech.auth.Domain.Entities.User;
import sba301.hrtech.auth.Domain.Exceptions.Auth.WrongPasswordException;
import sba301.hrtech.auth.Domain.Exceptions.User.UserExistException;
import sba301.hrtech.auth.Domain.Exceptions.User.UserNotFoundException;
import sba301.hrtech.auth.Dtos.User.Request.ChangePasswordRequest;
import sba301.hrtech.auth.Dtos.User.Request.CreateUserRequest;
import sba301.hrtech.auth.Dtos.User.Request.UserCommonRequest;
import sba301.hrtech.auth.Dtos.User.Respone.UserResponse;
import sba301.hrtech.auth.Mapper.UserProfile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService implements sba301.hrtech.auth.Abstrations.Service.UserService  {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfile userMapper;
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
        Role role = null;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(UUID.fromString(request.getRoleId()))
                    .orElseThrow(() -> new RuntimeException(ErrorCode.Role_Not_Found));
        }
        userMapper.update(user, request, role);
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