package hrtech.notification.abstractions.cache;

public interface IRedisRateLimitService {

    boolean isAllowed(String type, String key);
}
