package hrtech.subscription.dtos.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import hrtech.subscription.entities.enums.SubscriptionStatus;

public record MySubscriptionResponse(
    UUID id,
    UUID planId,
    String planName,
    Long planPrice,
    SubscriptionStatus status,
    Instant startDate,
    Instant endDate,
    Integer aiCreditBalance,
    Integer jobPostBalance,
    Integer dailyAiLimit,
    Integer weeklyAiLimit,
    Integer dailyAiUsage,
    Integer weeklyAiUsage,
    Instant lastDailyReset,
    Instant lastWeeklyReset,
    List<SubFeatureUsageResponse> featuresUsage
) {}
