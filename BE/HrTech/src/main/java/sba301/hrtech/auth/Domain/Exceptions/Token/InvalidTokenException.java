package sba301.hrtech.auth.Domain.Exceptions.Token;


import sba301.hrtech.auth.Domain.Common.ErrorCode;

public class InvalidTokenException extends TokenException {
    public InvalidTokenException(String message) {
        super(ErrorCode.TOKEN_INVALID, message);
    }
}