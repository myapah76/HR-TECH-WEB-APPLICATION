package sba301.hrtech.auth.Abstrations.Service;


import sba301.hrtech.auth.Dtos.Auth.Request.ConfirmOtpRequest;
import sba301.hrtech.auth.Dtos.Auth.Request.RegisterRequest;
import sba301.hrtech.auth.Dtos.User.Request.LoginRequest;
import sba301.hrtech.auth.Dtos.User.Request.RefreshRequest;
import sba301.hrtech.auth.Dtos.User.Respone.AuthResponse;
import sba301.hrtech.auth.Dtos.User.Respone.UserResponse;

public interface AuthService {
    void register(RegisterRequest request);
    UserResponse confirmOtp(ConfirmOtpRequest request);

    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(String accessToken);
}
