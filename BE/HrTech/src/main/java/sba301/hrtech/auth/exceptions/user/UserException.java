package sba301.hrtech.auth.exceptions.user;

import org.springframework.http.HttpStatus;
import sba301.hrtech.shared.exceptions.AppException;

public class UserException extends AppException {

    public UserException(String code, String message) {
        super(HttpStatus.NOT_FOUND, code, message);
    }

    protected UserException(HttpStatus status, String code, String message) {
        super(status, code, message);
    }
}
