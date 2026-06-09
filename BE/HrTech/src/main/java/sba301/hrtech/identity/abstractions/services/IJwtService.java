package sba301.hrtech.identity.abstractions.services;

import org.springframework.security.core.userdetails.UserDetails;

public interface IJwtService {
    String extractUsername(String token);
    String extractJwtId(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
}
