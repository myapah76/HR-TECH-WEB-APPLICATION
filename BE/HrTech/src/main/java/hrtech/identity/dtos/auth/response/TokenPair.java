package hrtech.identity.dtos.auth.response;

public record TokenPair(AuthResponse authResponse, String refreshToken) {
}
