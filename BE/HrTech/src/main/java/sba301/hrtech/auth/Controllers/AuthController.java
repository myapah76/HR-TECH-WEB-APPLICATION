package sba301.hrtech.auth.Controllers;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.auth.Abstrations.Service.AuthService;
import sba301.hrtech.auth.Domain.Exceptions.Token.TokenExpiredException;
import sba301.hrtech.auth.Dtos.Auth.Request.ConfirmOtpRequest;
import sba301.hrtech.auth.Dtos.Auth.Request.RegisterRequest;
import sba301.hrtech.auth.Dtos.User.Request.LoginRequest;
import sba301.hrtech.auth.Dtos.User.Request.RefreshRequest;
import sba301.hrtech.auth.Dtos.User.Respone.AuthResponse;
import sba301.hrtech.auth.Dtos.User.Respone.UserResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            throw new TokenExpiredException("Missing token");
        }

        String token = header.substring(7);
        authService.logout(token);

        return ResponseEntity.ok().build();
    }
}