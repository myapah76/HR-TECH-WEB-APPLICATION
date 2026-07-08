package hrtech.identity.abstractions.services;

import hrtech.identity.dtos.auth.request.*;
import hrtech.identity.dtos.auth.response.TokenPair;
import hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import hrtech.identity.dtos.auth.response.EmailActionResponse;



public interface IAuthService {
    EmailActionResponse register(RegisterRequest request);
    EmailActionResponse forgetPassword(ForgetPasswordRequest request);
    EmailActionResponse reSendOtp(ResendOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(ChangePasswordRequest request);
    ConfirmOtpResult confirmOtp(ConfirmOtpRequest request);
    TokenPair login(LoginRequest request);
    TokenPair googleLogin(GoogleLoginRequest request);
    TokenPair setupPassword(SetupPasswordRequest request);
    TokenPair refresh(String request);
    void logout(String refreshToken);
}
