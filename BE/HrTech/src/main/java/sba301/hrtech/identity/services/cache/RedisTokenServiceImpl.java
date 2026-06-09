package sba301.hrtech.identity.services.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import sba301.hrtech.identity.abstractions.cache.IRedisTokenService;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisTokenServiceImpl implements IRedisTokenService {
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String PREFIX = "blacklist:";

    @Override
    public void blacklistToken(String jti, long ttlMs) {
        redisTemplate.opsForValue().set(PREFIX + jti, "revoked", ttlMs, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti));
    }
}
