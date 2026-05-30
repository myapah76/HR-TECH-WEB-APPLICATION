package sba301.hrtech.shared.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.common.ErrorResponse;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(
            AppException ex,
            HttpServletRequest request
    ) {
        return buildError(
                ex.getStatus(),
                ex.getMessage(),
                ex.getCode(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildError(
                HttpStatus.BAD_REQUEST,
                message,
                ErrorCode.VALIDATION_ERROR,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(
            Exception ex,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error",
                ErrorCode.INTERNAL_ERROR,
                request.getRequestURI()
        );
    }

    private ResponseEntity<ErrorResponse> buildError(
            HttpStatus status,
            String message,
            String code,
            String path
    ) {
        ErrorResponse error = new ErrorResponse(
                status.value(),
                message,
                code,
                Instant.now(),
                path
        );
        return new ResponseEntity<>(error, status);
    }
}


