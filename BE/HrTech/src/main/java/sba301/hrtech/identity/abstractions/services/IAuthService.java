package sba301.hrtech.identity.abstractions.services;

import sba301.hrtech.identity.dtos.auth.request.*;
import sba301.hrtech.identity.dtos.auth.response.TokenPair;
import sba301.hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;

import javax.management.relation.RoleNotFoundException;

public interface IAuthService {
    EmailActionResponse register(RegisterRequest request);
    EmailActionResponse forgetPassword(ForgetPasswordRequest request);
    EmailActionResponse reSendOtp(ResendOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(ChangePasswordRequest request);
    ConfirmOtpResult confirmOtp(ConfirmOtpRequest request) throws RoleNotFoundException;
    TokenPair login(LoginRequest request);
    TokenPair refresh(String request);
    void logout(String refreshToken);
}
