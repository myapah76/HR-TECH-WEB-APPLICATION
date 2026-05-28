package sba301.hrtech.auth.Domain.Exceptions.Auth;


import sba301.hrtech.shared.Common.ErrorCode;

public class WrongOtpCodeException extends AuthException {
    public WrongOtpCodeException(String message) {
        super(ErrorCode.Wrong_Otp_Code, message);
    }
}
