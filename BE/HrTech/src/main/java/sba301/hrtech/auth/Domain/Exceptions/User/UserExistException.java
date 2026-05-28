package sba301.hrtech.auth.Domain.Exceptions.User;

import sba301.hrtech.shared.Common.ErrorCode;

public class UserExistException extends UserException {
    public UserExistException(String message) {
        super(ErrorCode.Email_Already_Registered,message);
    }
}
