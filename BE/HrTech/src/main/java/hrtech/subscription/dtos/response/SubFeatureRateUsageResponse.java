package hrtech.subscription.dtos.response;

import hrtech.subscription.entities.enums.ResetType;

import java.time.Instant;

public record SubFeatureRateUsageResponse(
    ResetType resetType,
    Integer capQuota,
    Integer used,
    Instant lastResetDate
) {}
