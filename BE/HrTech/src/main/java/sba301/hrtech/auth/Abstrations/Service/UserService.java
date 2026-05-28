package sba301.hrtech.auth.Abstrations.Service;



import sba301.hrtech.auth.Dtos.User.Request.ChangePasswordRequest;
import sba301.hrtech.auth.Dtos.User.Request.CreateUserRequest;
import sba301.hrtech.auth.Dtos.User.Request.UserCommonRequest;
import sba301.hrtech.auth.Dtos.User.Respone.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getById(UUID id);
    List<UserResponse> getAll();
    UserResponse update(UserCommonRequest request);
    UserResponse changePassword(ChangePasswordRequest request);
    void deleteById(UUID id);
}
