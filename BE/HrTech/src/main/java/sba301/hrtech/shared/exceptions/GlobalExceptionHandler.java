package sba301.hrtech.shared.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.spel.SpelEvaluationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.response.ApiResponse;

import org.springframework.security.access.AccessDeniedException;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(
            AppException ex,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = ex.getErrorCode();
        return buildError(
                errorCode.getStatusCode(),
                ex.getMessage(),
                errorCode,
                request.getRequestURI(),
                ex.getData()
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

    @ExceptionHandler(SpelEvaluationException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpelEvaluation(
            SpelEvaluationException ex,
            HttpServletRequest request
    ) {
        log.error("Security expression evaluation failed for request {}", request.getRequestURI(), ex);
        return buildError(
                HttpStatus.FORBIDDEN,
                "Bạn không có quyền truy cập tài nguyên này!",
                ErrorCode.FORBIDDEN,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthorizationDenied(
            AuthorizationDeniedException ex,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.FORBIDDEN,
                "Bạn không có quyền truy cập tài nguyên này!",
                ErrorCode.FORBIDDEN,
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAll(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("Unhandled exception for request {}", request.getRequestURI(), ex);
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
            ErrorCode code,
            String path
    ) {
        return buildError(status, message, code, path, null);
    }

    private <T> ResponseEntity<ApiResponse<T>> buildError(
            HttpStatus status,
            String message,
            ErrorCode code,
            String path,
            T data
    ) {
        ApiResponse<T> error = ApiResponse.<T>builder()
                .code(status.value())
                .message(message)
                .errorCode(code.name())
                .path(path)
                .timestamp(java.time.Instant.now())
                .data(data)
                .build();
        return new ResponseEntity<>(error, status);
    }
}

