package sba301.hrtech.auth.exceptions.auth;

import org.springframework.http.HttpStatus;
import sba301.hrtech.shared.exceptions.AppException;

public class AuthException extends AppException {

    public AuthException(String code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }
}
