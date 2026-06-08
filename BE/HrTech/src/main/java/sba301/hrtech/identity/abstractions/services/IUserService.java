package sba301.hrtech.identity.abstractions.services;

import sba301.hrtech.identity.dtos.user.request.ChangePasswordRequest;
import sba301.hrtech.identity.dtos.user.request.CreateUserRequest;
import sba301.hrtech.identity.dtos.user.request.UserCommonRequest;
import sba301.hrtech.identity.dtos.user.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface IUserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getById(UUID id);
    List<UserResponse> getAll();
    UserResponse update(UserCommonRequest request);
    UserResponse changePassword(ChangePasswordRequest request);
    void deleteById(UUID id);
}
