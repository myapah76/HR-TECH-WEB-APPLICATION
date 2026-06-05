package sba301.hrtech.notification.services.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import sba301.hrtech.notification.abstractions.cache.IRedisRateLimitService;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class RedisRateLimitServiceImpl implements IRedisRateLimitService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisScript<Long> rateLimitScript;

    private static final String PREFIX = "rate_limit:";
    private static final int MAX_REQUESTS = 5;
    private static final int WINDOW_SECONDS = 60;

    @Override
    public boolean isAllowed(String type, String key) {
        String redisKey =  PREFIX + type + ":" + key;

        Long result = redisTemplate.execute(
                rateLimitScript,
                Collections.singletonList(redisKey),
                WINDOW_SECONDS,
                MAX_REQUESTS
        );

        return result == 1;
    }
}
