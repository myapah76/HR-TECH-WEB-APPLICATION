package sba301.hrtech.identity.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.entities.User;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthUtils {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Phiên đăng nhập không tồn tại hoặc đã hết hạn!");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.user();
        }
        if (principal instanceof User user) {
            return user;
        }
        throw new RuntimeException("Tài khoản chưa được xác thực!");
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}