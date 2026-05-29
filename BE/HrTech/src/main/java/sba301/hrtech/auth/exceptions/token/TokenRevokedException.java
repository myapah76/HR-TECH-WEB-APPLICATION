package sba301.hrtech.auth.exceptions.token;

import sba301.hrtech.shared.common.ErrorCode;

public class TokenRevokedException extends TokenException {
    public TokenRevokedException(String message) {
        super(ErrorCode.TOKEN_REVOKED, message);
    }
}
