package sba301.hrtech.auth.exceptions.token;

import org.springframework.http.HttpStatus;
import sba301.hrtech.shared.exceptions.AppException;

public class TokenException extends AppException {

    public TokenException(String code, String message) {
        super(HttpStatus.UNAUTHORIZED, code, message);
    }
}
