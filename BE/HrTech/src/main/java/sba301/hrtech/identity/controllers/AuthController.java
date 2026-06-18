package sba301.hrtech.identity.controllers;


import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.identity.abstractions.services.IAuthService;
import sba301.hrtech.identity.dtos.auth.request.*;
import jakarta.servlet.http.HttpServletResponse;
import sba301.hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;
import sba301.hrtech.identity.dtos.auth.response.AuthResponse;
import sba301.hrtech.identity.dtos.auth.response.TokenPair;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.shared.response.ApiResponse;

import javax.management.relation.RoleNotFoundException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<EmailActionResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        EmailActionResponse response = authService.register(request);

        return ResponseEntity.ok(ApiResponse.success(response, "Register successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<EmailActionResponse>> forgotPassword(
            @Valid @RequestBody ForgetPasswordRequest request) {

        EmailActionResponse response = authService.forgetPassword(request);

        return ResponseEntity.ok(ApiResponse.success(response, "OTP sent successfully"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<EmailActionResponse>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        EmailActionResponse response = authService.reSendOtp(request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "OTP resent successfully")
        );
    }

    @PostMapping("/confirm-otp")
    public ResponseEntity<ApiResponse<ConfirmOtpResult>> confirmOtp(
            @RequestBody ConfirmOtpRequest request) throws RoleNotFoundException {

        ConfirmOtpResult response = authService.confirmOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response, "OTP confirmed successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        authService.changePassword(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "X-Cookies-Enabled", defaultValue = "true") String cookiesEnabled,
            HttpServletResponse response) {

        TokenPair tokenPair = authService.login(request);
        AuthResponse authResponse = tokenPair.authResponse();
        
        if ("true".equalsIgnoreCase(cookiesEnabled)) {
            setRefreshTokenCookie(response, tokenPair.refreshToken());
            authResponse.setRefreshToken(null);
        }

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(value = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshRequest request,
            @RequestHeader(value = "X-Cookies-Enabled", defaultValue = "true") String cookiesEnabled,
            HttpServletResponse response) {

        String refreshToken = cookieRefreshToken != null ? cookieRefreshToken : (request != null ? request.getRefreshToken() : null);
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Refresh token is required");
        }

        TokenPair tokenPair = authService.refresh(refreshToken);
        AuthResponse authResponse = tokenPair.authResponse();

        if ("true".equalsIgnoreCase(cookiesEnabled)) {
            setRefreshTokenCookie(response, tokenPair.refreshToken());
            authResponse.setRefreshToken(null);
        }

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(value = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshRequest request,
            HttpServletResponse response) {

        String refreshToken = cookieRefreshToken != null ? cookieRefreshToken : (request != null ? request.getRefreshToken() : null);

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        clearRefreshTokenCookie(response);

        return ResponseEntity.ok(ApiResponse.success(null, "Logout successfully"));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true) // Yêu cầu HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Strict") // Chống CSRF
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Xóa cookie
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}