package sba301.hrtech.auth.Domain.Exceptions.User;

import sba301.hrtech.shared.Common.ErrorCode;

public class UserNotFoundException extends UserException {
    public UserNotFoundException(String message) {
        super(ErrorCode.NOT_FOUND,message);
    }
}
