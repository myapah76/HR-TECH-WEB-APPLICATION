package sba301.hrtech.auth.Domain.Exceptions.Token;


import sba301.hrtech.shared.Common.ErrorCode;

public class InvalidTokenException extends TokenException {
    public InvalidTokenException(String message) {
        super(ErrorCode.TOKEN_INVALID, message);
    }
}