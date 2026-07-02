package sba301.hrtech.identity.abstractions.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sba301.hrtech.identity.dtos.user.request.ChangePasswordRequest;
import sba301.hrtech.identity.dtos.user.request.CreateUserRequest;
import sba301.hrtech.identity.dtos.user.request.UserCommonRequest;
import sba301.hrtech.identity.dtos.user.response.UserResponse;
import sba301.hrtech.identity.entities.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserResponseById(UUID id);
    List<UserResponse> getAll();
    Page<UserResponse> getAdminUsers(String role, Boolean isBlocked, String email, Pageable pageable);
    UserResponse update(UserCommonRequest request);
    UserResponse updateBlockStatus(UUID userId, Boolean isBlocked);
    UserResponse changePassword(ChangePasswordRequest request);
    void deleteById(UUID id);


    User getUserEntityById(UUID id);
    User saveUserEntity(User user);
    User getUserEntityByEmail(String email);
    boolean existsByEmail(String email);

}
