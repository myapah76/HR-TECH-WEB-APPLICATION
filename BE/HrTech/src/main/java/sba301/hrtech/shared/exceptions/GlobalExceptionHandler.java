package sba301.hrtech.shared.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.response.ApiResponse;

import org.springframework.security.access.AccessDeniedException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(
            AppException ex,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = ex.getErrorCode();
        return buildError(
                errorCode.getStatusCode(),
                ex.getMessage(),
                errorCode,
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
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error",
                ErrorCode.INTERNAL_ERROR,
                request.getRequestURI()
        );
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

    // Bắt lỗi khi user đã authenticated nhưng không có quyền truy cập tài nguyên nào đó
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.FORBIDDEN,
                "Bạn không có quyền truy cập tài nguyên này!",
                ErrorCode.FORBIDDEN,
                request.getRequestURI()
        );
    }

    private ResponseEntity<ApiResponse<Void>> buildError(
            HttpStatus status,
            String message,
            ErrorCode code,
            String path
    ) {
        ApiResponse<Void> error = ApiResponse.failed(
                status.value(),
                message,
                code.name(),
                path
        );
        return new ResponseEntity<>(error, status);
    }
}

