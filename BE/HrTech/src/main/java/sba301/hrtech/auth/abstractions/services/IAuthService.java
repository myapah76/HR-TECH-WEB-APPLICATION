package sba301.hrtech.auth.abstractions.services;

import sba301.hrtech.auth.dtos.auth.request.ConfirmOtpRequest;
import sba301.hrtech.auth.dtos.auth.request.LoginRequest;
import sba301.hrtech.auth.dtos.auth.request.RefreshRequest;
import sba301.hrtech.auth.dtos.auth.request.RegisterRequest;
import sba301.hrtech.auth.dtos.auth.response.AuthResponse;
import sba301.hrtech.auth.dtos.auth.response.RegisterResponse;
import sba301.hrtech.auth.dtos.auth.response.TokenResponse;
import sba301.hrtech.auth.dtos.user.response.UserResponse;

public interface IAuthService {
    RegisterResponse register(RegisterRequest request);
    UserResponse confirmOtp(ConfirmOtpRequest request);

    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String request);
    void logout(String refreshToken);
}
