package sba301.hrtech.identity.controllers;


import jakarta.servlet.http.Cookie;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.identity.abstractions.services.IAuthService;
import sba301.hrtech.identity.dtos.auth.request.*;
import jakarta.servlet.http.HttpServletResponse;
import sba301.hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;
import sba301.hrtech.identity.dtos.auth.response.AuthResponse;
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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);

        Cookie refreshToken = new Cookie(
                "refreshToken",
                authResponse.getRefreshToken()
        );

        refreshToken.setHttpOnly(true);
        refreshToken.setPath("/");
        refreshToken.setMaxAge(60 * 60 * 24 * 7);

        response.addCookie(refreshToken);

        authResponse.setRefreshToken("");

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue("refreshToken") String refreshToken,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.refresh(refreshToken);

        Cookie refreshCookie = new Cookie(
                "refreshToken",
                authResponse.getRefreshToken()
        );

        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60 * 60 * 24 * 7);

        response.addCookie(refreshCookie);

        authResponse.setRefreshToken("");

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }


    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);

        response.addCookie(refreshCookie);

        return ResponseEntity.ok(ApiResponse.success(null, "Logout successfully"));
    }
}