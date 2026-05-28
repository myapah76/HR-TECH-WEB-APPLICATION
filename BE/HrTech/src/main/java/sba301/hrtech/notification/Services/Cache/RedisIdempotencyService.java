package sba301.hrtech.notification.Services.Cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisIdempotencyService implements sba301.hrtech.notification.Abstractions.Cache.RedisIdempotencyService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String PREFIX = "otp:idempotency:";
    private static final long TTL_MINUTES = 10;

    @Override
    public boolean isProcessed(String eventId) {
        return redisTemplate.hasKey(PREFIX + eventId);
    }

    @Override
    public void markProcessed(String eventId) {
        redisTemplate.opsForValue()
                .set(PREFIX + eventId, "1", TTL_MINUTES, TimeUnit.MINUTES);
    }
}
