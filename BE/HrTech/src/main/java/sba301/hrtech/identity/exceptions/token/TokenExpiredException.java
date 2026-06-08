package sba301.hrtech.identity.exceptions.token;

import sba301.hrtech.shared.common.ErrorCode;

public class TokenExpiredException extends TokenException {
    public TokenExpiredException(String message) {
        super(ErrorCode.TOKEN_EXPIRED, message);
    }
}
