package sba301.hrtech.auth.Abstrations.Service;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String extractUsername(String token);
    String extractJwtId(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
}
