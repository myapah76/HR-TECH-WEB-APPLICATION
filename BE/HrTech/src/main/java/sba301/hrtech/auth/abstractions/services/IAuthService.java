package sba301.hrtech.auth.abstractions.services;

import sba301.hrtech.auth.dtos.auth.request.*;
import sba301.hrtech.auth.dtos.auth.response.AuthResponse;
import sba301.hrtech.auth.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.auth.dtos.auth.response.EmailActionResponse;

import javax.management.relation.RoleNotFoundException;

public interface IAuthService {
    EmailActionResponse register(RegisterRequest request);
    EmailActionResponse forgetPassword(ForgetPasswordRequest request);
    EmailActionResponse reSendOtp(ResendOtpRequest request);
    void resetPassword(ResetPasswordRequest request);

    ConfirmOtpResult confirmOtp(ConfirmOtpRequest request) throws RoleNotFoundException;



    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String request);
    void logout(String refreshToken);
}
