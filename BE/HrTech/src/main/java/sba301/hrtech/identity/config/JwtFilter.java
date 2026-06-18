package sba301.hrtech.identity.config;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import sba301.hrtech.identity.abstractions.cache.IRedisTokenService;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.abstractions.services.IJwtService;

import java.io.IOException;
import sba301.hrtech.shared.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final IJwtService jwtService;
    private final IRedisTokenService redisTokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ") || request.getServletPath().startsWith("/api/auth/login")
                || request.getServletPath().startsWith("/api/auth/refresh")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);

        String path = request.getServletPath();

        try {

            String jti = jwtService.extractJwtId(token);
            if (redisTokenService.isBlacklisted(jti)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            String username = jwtService.extractUsername(token);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDetails userDetails = new CustomUserDetails(user);
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (username != null && authentication == null) {
                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

                    // Force Password Change Check
                    if (Boolean.TRUE.equals(user.getRequirePasswordChange())) {
                        if (!path.equals("/api/auth/change-password") && !path.equals("/api/auth/logout")) {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                            ApiResponse<Void> apiResponse = ApiResponse.failed(
                                    HttpServletResponse.SC_FORBIDDEN,
                                    "Bạn bắt buộc phải đổi mật khẩu trước khi sử dụng hệ thống.",
                                    "PASSWORD_CHANGE_REQUIRED",
                                    request.getRequestURI());

                            ObjectMapper objectMapper = new ObjectMapper();
                            objectMapper.registerModule(new JavaTimeModule());
                            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                            return;
                        }
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}