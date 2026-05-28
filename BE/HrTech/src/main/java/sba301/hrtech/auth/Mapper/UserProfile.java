package sba301.hrtech.auth.Mapper;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import sba301.hrtech.auth.Domain.Entities.Role;
import sba301.hrtech.auth.Domain.Entities.User;
import sba301.hrtech.auth.Dtos.User.Request.CreateUserRequest;
import sba301.hrtech.auth.Dtos.User.Request.UserCommonRequest;
import sba301.hrtech.auth.Dtos.User.Respone.UserResponse;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserProfile {
    private final RoleProfile roleProfile;

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setFirstName(user.getFirstName());
        res.setLastName(user.getLastName());
        res.setEmail(user.getEmail());
        res.setUsername(user.getUsername());
        res.setPhone(user.getPhone());
        res.setAddress(user.getAddress());
        res.setGender(user.getGender());
        res.setDateOfBirth(user.getDateOfBirth());
        res.setIsBlocked(user.getIsBlocked());
        res.setAvatarUrl(user.getAvatarUrl());
        res.setCreatedAt(user.getCreatedAt());
        res.setUpdatedAt(user.getUpdatedAt());
        if (user.getRole() != null) {
            res.setRoleResponse(roleProfile.mapToResponse(user.getRole()));
        }
        return res;
    }

    public User fromCreateRequest(CreateUserRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request must not be null");
        }

        var common = request.getUserCommonRequest();

        User user = new User();
        user.setFirstName(common.getFirstName());
        user.setLastName(common.getLastName());
        user.setEmail(common.getEmail());
        user.setUsername(common.getUsername());
        user.setPhone(common.getPhone());
        user.setAddress(common.getAddress());
        user.setGender(common.getGender());
        user.setDateOfBirth(common.getDateOfBirth());
        user.setAvatarUrl(common.getAvatarUrl());
        user.setAvatarPublicId(common.getAvatarPublicId());
        user.setPassword(user.getPassword());
        return user;
    }

    public void update(User user, UserCommonRequest request, Role role) {
        if (user == null || request == null) return;

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }

        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim().toLowerCase());
        }

        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getAvatarPublicId() != null) {
            user.setAvatarPublicId(request.getAvatarPublicId());
        }

        if (request.getIsBlocked() != null) {
            user.setIsBlocked(request.getIsBlocked());
        }

        if (role != null) {
            user.setRole(role);
        }
    }

    public UUID mapRoleId(String roleId) {
        return roleId != null ? UUID.fromString(roleId) : null;
    }
}
