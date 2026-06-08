package sba301.hrtech.identity.exceptions.auth;

import sba301.hrtech.shared.common.ErrorCode;

public class WrongPasswordException extends AuthException {
    public WrongPasswordException(String message) {
        super(ErrorCode.Wrong_Password, message);
    }
}
