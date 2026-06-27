package sba301.hrtech.subscription.dtos.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

public record MySubscriptionResponse(
    UUID id,
    UUID planId,
    String planName,
    Long planPrice,
    SubscriptionStatus status,
    Instant startDate,
    Instant endDate,
    List<SubFeatureUsageResponse> featuresUsage
) {}
