package sba301.hrtech.auth.Abstrations.Cache;

public interface IRedisTokenService {

    void blacklistToken(String jti, long ttlMs);

    boolean isBlacklisted(String jti);
}