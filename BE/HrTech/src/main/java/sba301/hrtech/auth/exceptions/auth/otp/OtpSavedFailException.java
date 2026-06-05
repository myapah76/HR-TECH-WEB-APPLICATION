package sba301.hrtech.auth.exceptions.auth.otp;

import sba301.hrtech.auth.exceptions.auth.AuthException;
import sba301.hrtech.shared.common.ErrorCode;

public class OtpSavedFailException extends AuthException {
    public OtpSavedFailException(String message) {
        super(ErrorCode.OTP_SAVE_FAILED, message);
    }
}
