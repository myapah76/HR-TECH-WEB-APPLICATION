package hrtech.identity.controllers;

import hrtech.identity.dtos.auth.request.*;
import hrtech.identity.utils.CookieUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.identity.abstractions.services.IAuthService;
import jakarta.servlet.http.HttpServletResponse;
import hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import hrtech.identity.dtos.auth.response.EmailActionResponse;
import hrtech.identity.dtos.auth.response.AuthResponse;
import hrtech.identity.dtos.auth.response.TokenPair;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.shared.response.ApiResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;
    private final CookieUtils cookieUtils;

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
                ApiResponse.success(response, "OTP resent successfully"));
    }

    @PostMapping("/confirm-otp")
    public ResponseEntity<ApiResponse<ConfirmOtpResult>> confirmOtp(
            @RequestBody ConfirmOtpRequest request) {

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

        handleRefreshTokenCookie(response, tokenPair, authResponse, cookiesEnabled);

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successfully"));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            @RequestHeader(value = "X-Cookies-Enabled", defaultValue = "true") String cookiesEnabled,
            HttpServletResponse response) {

        TokenPair tokenPair = authService.googleLogin(request);
        AuthResponse authResponse = tokenPair.authResponse();

        if (authResponse.getNeedsPasswordSetup() != null && authResponse.getNeedsPasswordSetup()) {
            return ResponseEntity.ok(ApiResponse.success(authResponse, "Password setup required"));
        }

        handleRefreshTokenCookie(response, tokenPair, authResponse, cookiesEnabled);

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Google login successfully"));
    }

    @PostMapping("/setup-password")
    public ResponseEntity<ApiResponse<AuthResponse>> setupPassword(
            @Valid @RequestBody SetupPasswordRequest request,
            @RequestHeader(value = "X-Cookies-Enabled", defaultValue = "true") String cookiesEnabled,
            HttpServletResponse response) {

        TokenPair tokenPair = authService.setupPassword(request);
        AuthResponse authResponse = tokenPair.authResponse();

        handleRefreshTokenCookie(response, tokenPair, authResponse, cookiesEnabled);

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Password setup successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(value = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshRequest request,
            @RequestHeader(value = "X-Cookies-Enabled", defaultValue = "true") String cookiesEnabled,
            HttpServletResponse response) {

        String refreshToken = cookieRefreshToken != null ? cookieRefreshToken
                : (request != null ? request.getRefreshToken() : null);
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Refresh token is required");
        }

        TokenPair tokenPair = authService.refresh(refreshToken);
        AuthResponse authResponse = tokenPair.authResponse();

        handleRefreshTokenCookie(response, tokenPair, authResponse, cookiesEnabled);

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(value = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshRequest request,
            HttpServletResponse response) {

        String refreshToken = cookieRefreshToken != null ? cookieRefreshToken
                : (request != null ? request.getRefreshToken() : null);

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        cookieUtils.clearRefreshTokenCookie(response);

        return ResponseEntity.ok(ApiResponse.success(null, "Logout successfully"));
    }

    private void handleRefreshTokenCookie(HttpServletResponse response, TokenPair tokenPair, AuthResponse authResponse,
            String cookiesEnabled) {
        if ("true".equalsIgnoreCase(cookiesEnabled)) {
            cookieUtils.setRefreshTokenCookie(response, tokenPair.refreshToken());
            authResponse.setRefreshToken(null);
        }
    }
}