package sba301.hrtech.identity.exceptions.user;

import sba301.hrtech.shared.common.ErrorCode;

public class UserNotFoundException extends UserException {
    public UserNotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }
}
