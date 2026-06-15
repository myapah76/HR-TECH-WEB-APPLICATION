package sba301.hrtech.shared.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.shared.error.ErrorCode;

@Getter
@Setter
@AllArgsConstructor
public class AppException extends RuntimeException{
    private final ErrorCode errorCode;
}

