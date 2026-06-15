package sba301.hrtech.identity.config;


import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.abstractions.services.IJwtService;
import sba301.hrtech.identity.services.cache.RedisTokenServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import sba301.hrtech.shared.response.ApiResponse;
import sba301.hrtech.shared.error.ErrorCode;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    /** Endpoint công khai, không cần JWT. */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/api/payments/webhook",
            "/api/subscription-plans/active",
            // Swagger
            "/swagger-ui/**",
            "/v3/api-docs/**"
    };

    private final IJwtService jwtService;
    private final RedisTokenServiceImpl redisTokenService;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtService, redisTokenService, userRepository);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        http
                // Cấu hình CORS để cho phép frontend (React) truy cập API
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Vô hiệu hóa CSRF, form login và HTTP Basic auth vì chúng ta sẽ dùng JWT
                .csrf(AbstractHttpConfigurer::disable)
                // Vô hiệu hóa form login và HTTP Basic auth vì chúng ta sẽ dùng JWT
                .formLogin(AbstractHttpConfigurer::disable)
                // Vô hiệu hóa HTTP Basic auth vì chúng ta sẽ dùng JWT
                .httpBasic(AbstractHttpConfigurer::disable)
                // Cấu hình phân quyền: cho phép truy cập công khai với các endpoint trong PUBLIC_ENDPOINTS
                // yêu cầu xác thực với các endpoint khác
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()
                )
                // Xử lý lỗi 401 và 403 trả về JSON chuẩn ApiResponse
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                            ApiResponse<Void> apiResponse = ApiResponse.failed(
                                    HttpServletResponse.SC_UNAUTHORIZED,
                                    "Yêu cầu xác thực không hợp lệ hoặc thiếu token!",
                                    ErrorCode.UNAUTHORIZED.name(),
                                    request.getRequestURI()
                            );

                            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                            ApiResponse<Void> apiResponse = ApiResponse.failed(
                                    HttpServletResponse.SC_FORBIDDEN,
                                    "Bạn không có quyền truy cập tài nguyên này!",
                                    ErrorCode.FORBIDDEN.name(),
                                    request.getRequestURI()
                            );

                            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                        })
                )
                // Thêm JwtFilter vào trước UsernamePasswordAuthenticationFilter
                // để xử lý JWT trước khi Spring Security thực hiện xác thực
                .addFilterBefore(jwtFilter(),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}