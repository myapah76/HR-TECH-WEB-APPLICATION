package sba301.hrtech.auth.exceptions.user;

import org.springframework.http.HttpStatus;
import sba301.hrtech.shared.common.ErrorCode;

public class UserExistException extends UserException {
    public UserExistException(String message) {
        super(HttpStatus.CONFLICT, ErrorCode.Email_Already_Registered, message);
    }
}
