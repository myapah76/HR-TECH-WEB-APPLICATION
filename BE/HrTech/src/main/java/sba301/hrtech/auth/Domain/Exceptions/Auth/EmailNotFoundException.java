package sba301.hrtech.auth.Domain.Exceptions.Auth;


import sba301.hrtech.auth.Domain.Common.ErrorCode;

public class EmailNotFoundException extends AuthException {
    public EmailNotFoundException(String message) {
        super(ErrorCode.Email_Not_Found, message);
    }
}
