package hrtech.identity.abstractions.services;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

public interface IJwtService {
    String extractUsername(String token);
    String extractJwtId(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
    String generateToken(UserDetails userDetails);
    Date extractExpiration(String token);
}
