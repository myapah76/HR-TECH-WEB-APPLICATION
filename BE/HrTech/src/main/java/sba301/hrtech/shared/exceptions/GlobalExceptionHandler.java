package sba301.hrtech.shared.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.common.ApiResponse;
import sba301.hrtech.shared.common.ErrorCode;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(
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
    public ResponseEntity<ApiResponse<Void>> handleValidation(
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
    public ResponseEntity<ApiResponse<Void>> handleAll(
            Exception ex,
            HttpServletRequest request
    ) {
        ex.printStackTrace(); // Log lỗi ra console để debug
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error",
                ErrorCode.INTERNAL_ERROR,
                request.getRequestURI()
        );
    }

    private ResponseEntity<ApiResponse<Void>> buildError(
            HttpStatus status,
            String message,
            String code,
            String path
    ) {
        ApiResponse<Void> error = ApiResponse.failed(
                status.value(),
                message,
                code,
                path
        );
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingCookie(
            MissingRequestCookieException ex,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.UNAUTHORIZED, // 401
                ex.getCookieName() + " is required",
                ErrorCode.MISSING_COOKIE,
                request.getRequestURI()
        );
    }
}


