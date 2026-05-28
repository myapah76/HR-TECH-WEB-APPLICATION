package sba301.hrtech.auth.Domain.Exceptions.Auth;


import sba301.hrtech.shared.Common.ErrorCode;

public class OtpExpiredException extends AuthException {
    public OtpExpiredException(String message) {
        super(ErrorCode.Otp_Expired, message);
    }
}
