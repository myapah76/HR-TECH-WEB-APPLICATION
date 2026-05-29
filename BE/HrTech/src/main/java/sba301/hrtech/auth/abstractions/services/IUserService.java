package sba301.hrtech.auth.abstractions.services;

import sba301.hrtech.auth.dtos.user.request.ChangePasswordRequest;
import sba301.hrtech.auth.dtos.user.request.CreateUserRequest;
import sba301.hrtech.auth.dtos.user.request.UserCommonRequest;
import sba301.hrtech.auth.dtos.user.respone.UserResponse;

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
