package sba301.hrtech.auth.Domain.Exceptions.Auth;


import sba301.hrtech.auth.Domain.Common.ErrorCode;

public class WrongPasswordException extends AuthException{
    public WrongPasswordException(String message) {
        super(ErrorCode.Email_Not_Found, message);
    }
}
