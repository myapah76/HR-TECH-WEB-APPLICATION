package sba301.hrtech.notification.Services.Cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class RedisRateLimitService implements sba301.hrtech.notification.Abstractions.Cache.RedisRateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisScript<Long> rateLimitScript;

    private static final String PREFIX = "rate_limit:";
    private static final int MAX_REQUESTS = 5;
    private static final int WINDOW_SECONDS = 60;

    @Override
    public boolean isAllowed(String key) {
        String redisKey = PREFIX + "otp:" + key;

        Long result = redisTemplate.execute(
                rateLimitScript,
                Collections.singletonList(redisKey),
                WINDOW_SECONDS,
                MAX_REQUESTS
        );

        return result == 1;
    }
}