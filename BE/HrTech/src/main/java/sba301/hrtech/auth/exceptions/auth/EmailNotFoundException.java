package sba301.hrtech.auth.exceptions.auth;

import sba301.hrtech.shared.common.ErrorCode;

public class EmailNotFoundException extends AuthException {
    public EmailNotFoundException(String message) {
        super(ErrorCode.Email_Not_Found, message);
    }
}
