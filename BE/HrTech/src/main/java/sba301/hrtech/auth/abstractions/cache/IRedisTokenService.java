package sba301.hrtech.auth.abstractions.cache;

public interface IRedisTokenService {

    void blacklistToken(String jti, long ttlMs);

    boolean isBlacklisted(String jti);
}
