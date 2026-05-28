package sba301.hrtech.auth.Domain.Exceptions.Auth;

import sba301.hrtech.shared.Common.ErrorCode;

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

