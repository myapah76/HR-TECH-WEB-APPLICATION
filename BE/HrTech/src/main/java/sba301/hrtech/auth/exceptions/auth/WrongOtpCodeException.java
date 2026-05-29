package sba301.hrtech.auth.exceptions.auth;

import sba301.hrtech.shared.common.ErrorCode;

public class WrongOtpCodeException extends AuthException {
    public WrongOtpCodeException(String message) {
        super(ErrorCode.Wrong_Otp_Code, message);
    }
}
