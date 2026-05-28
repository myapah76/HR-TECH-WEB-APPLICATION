package sba301.hrtech.notification.Abstractions.Cache;

public interface RedisIdempotencyService {

    boolean isProcessed(String eventId);

    void markProcessed(String eventId);
}
