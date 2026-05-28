package sba301.hrtech.auth.Domain.Exceptions.Token;

import lombok.Getter;

@Getter
public class TokenException extends RuntimeException {

    private final String code;

    public TokenException(String code, String message) {
        super(message);
        this.code = code;
    }

}
