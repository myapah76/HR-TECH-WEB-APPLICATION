package sba301.hrtech.auth.Domain.Exceptions.Token;

import sba301.hrtech.auth.Domain.Common.ErrorCode;

public class TokenRevokedException extends TokenException {
    public TokenRevokedException(String message) {
        super(ErrorCode.TOKEN_REVOKED, message);
    }
}
