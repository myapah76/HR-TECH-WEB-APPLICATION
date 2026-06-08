package sba301.hrtech.identity.exceptions.token;

import sba301.hrtech.shared.common.ErrorCode;

public class InvalidTokenException extends TokenException {
    public InvalidTokenException(String message) {
        super(ErrorCode.TOKEN_INVALID, message);
    }
}
