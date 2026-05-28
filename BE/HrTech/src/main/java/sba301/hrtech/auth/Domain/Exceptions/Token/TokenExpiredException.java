package sba301.hrtech.auth.Domain.Exceptions.Token;

import sba301.hrtech.shared.Common.ErrorCode;

public class TokenExpiredException extends TokenException {
    public TokenExpiredException(String message) {
        super(ErrorCode.TOKEN_EXPIRED, message);
    }
}