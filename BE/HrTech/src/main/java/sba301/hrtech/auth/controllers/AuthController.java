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
import sba301.hrtech.auth.dtos.auth.response.TokenResponse;
import sba301.hrtech.auth.exceptions.token.TokenExpiredException;
import sba301.hrtech.auth.dtos.auth.request.ConfirmOtpRequest;
import sba301.hrtech.auth.dtos.auth.request.RegisterRequest;
import sba301.hrtech.auth.dtos.auth.response.AuthResponse;
import sba301.hrtech.auth.dtos.user.response.UserResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/confirm-otp")
    public UserResponse confirmOtp(@RequestBody ConfirmOtpRequest request){
        return authService.confirmOtp(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);

        Cookie refreshCookie = new Cookie(
                "refreshToken",
                authResponse.getRefreshToken()
        );

        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(refreshCookie);
        return authResponse;
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(
            @CookieValue("refreshToken") String refreshToken,
            HttpServletResponse response
    ) {
        return  authService.refresh(refreshToken);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "accessToken", required = false) String accessToken,
            HttpServletResponse response
    ) {

        if (accessToken != null) {
            authService.logout(accessToken);
        }

        Cookie accessCookie = new Cookie("accessToken", null);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        return ResponseEntity.ok().build();
    }
}