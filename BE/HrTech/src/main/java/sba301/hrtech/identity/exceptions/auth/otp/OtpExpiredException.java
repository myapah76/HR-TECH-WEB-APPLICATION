package sba301.hrtech.identity.exceptions.auth.otp;

import sba301.hrtech.identity.exceptions.auth.AuthException;
import sba301.hrtech.shared.common.ErrorCode;

public class OtpExpiredException extends AuthException {
    public OtpExpiredException(String message) {
        super(ErrorCode.Otp_Expired, message);
    }
}
