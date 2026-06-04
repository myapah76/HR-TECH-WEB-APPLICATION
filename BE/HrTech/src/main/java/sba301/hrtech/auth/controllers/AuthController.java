package sba301.hrtech.auth.controllers;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.auth.abstractions.services.IAuthService;
import sba301.hrtech.auth.dtos.auth.request.LoginRequest;
import jakarta.servlet.http.HttpServletResponse;
import sba301.hrtech.auth.dtos.auth.request.RefreshRequest;
import sba301.hrtech.auth.dtos.auth.response.RegisterResponse;
import sba301.hrtech.auth.dtos.auth.response.TokenResponse;
import sba301.hrtech.auth.exceptions.token.TokenExpiredException;
import sba301.hrtech.auth.dtos.auth.request.ConfirmOtpRequest;
import sba301.hrtech.auth.dtos.auth.request.RegisterRequest;
import sba301.hrtech.auth.dtos.auth.response.AuthResponse;
import sba301.hrtech.auth.dtos.user.response.UserResponse;
import sba301.hrtech.shared.common.ApiResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response = authService.register(request);

        return ResponseEntity.ok(
                ApiResponse.<RegisterResponse>builder()
                        .success(true)
                        .message("Register successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/confirm-otp")
    public ResponseEntity<ApiResponse<UserResponse>> confirmOtp(
            @RequestBody ConfirmOtpRequest request) {

        UserResponse response = authService.confirmOtp(request);

        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("OTP confirmed successfully")
                        .data(response)
                        .build()
        );
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

        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Login successfully")
                        .data(authResponse)
                        .build()
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue("refreshToken") String refreshToken,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.refresh(refreshToken);
        authResponse.setRefreshToken("");

        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Token refreshed successfully")
                        .data(authResponse)
                        .build()
        );
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

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Logout successfully")
                        .build()
        );
    }
}