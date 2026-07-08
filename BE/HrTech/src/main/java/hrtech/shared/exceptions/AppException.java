package hrtech.shared.exceptions;

import lombok.Getter;
import hrtech.shared.error.ErrorCode;

@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private Object data;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage != null ? customMessage : errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String customMessage, Object data) {
        super(customMessage != null ? customMessage : errorCode.getMessage());
        this.errorCode = errorCode;
        this.data = data;
    }
}

