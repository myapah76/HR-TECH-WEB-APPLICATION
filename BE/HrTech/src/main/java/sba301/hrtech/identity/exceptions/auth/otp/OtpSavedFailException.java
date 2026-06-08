package sba301.hrtech.identity.exceptions.auth.otp;

import sba301.hrtech.identity.exceptions.auth.AuthException;
import sba301.hrtech.shared.common.ErrorCode;

public class OtpSavedFailException extends AuthException {
    public OtpSavedFailException(String message) {
        super(ErrorCode.OTP_SAVE_FAILED, message);
    }
}
