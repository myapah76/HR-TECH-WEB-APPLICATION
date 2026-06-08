package sba301.hrtech.identity.exceptions.auth.otp;

import sba301.hrtech.identity.exceptions.auth.AuthException;
import sba301.hrtech.shared.common.ErrorCode;

public class OtpRateLimitException extends AuthException {
    public OtpRateLimitException(String message) {
        super(ErrorCode.OTP_RATE_LIMIT_EXCEEDED, message);
    }
}
