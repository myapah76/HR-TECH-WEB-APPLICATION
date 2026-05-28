package sba301.hrtech.notification.Abstractions.Cache;

public interface RedisRateLimitService {

    boolean isAllowed(String key);
}