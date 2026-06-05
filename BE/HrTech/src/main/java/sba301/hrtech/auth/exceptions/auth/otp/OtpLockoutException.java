package sba301.hrtech.auth.exceptions.auth.otp;

import sba301.hrtech.auth.exceptions.auth.AuthException;
import sba301.hrtech.shared.common.ErrorCode;

public class OtpLockoutException extends AuthException {
    private final long lockoutRemainingSeconds;

    public OtpLockoutException(String message, long lockoutRemainingSeconds) {
        super(ErrorCode.Too_Many_Failed_Attempts, message);
        this.lockoutRemainingSeconds = lockoutRemainingSeconds;
    }

    public long getLockoutRemainingSeconds() {
        return lockoutRemainingSeconds;
    }
}
