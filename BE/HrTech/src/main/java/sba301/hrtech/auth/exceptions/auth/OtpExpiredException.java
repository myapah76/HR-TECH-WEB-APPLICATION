package sba301.hrtech.auth.exceptions.auth;

import sba301.hrtech.shared.common.ErrorCode;

public class OtpExpiredException extends AuthException {
    public OtpExpiredException(String message) {
        super(ErrorCode.Otp_Expired, message);
    }
}
