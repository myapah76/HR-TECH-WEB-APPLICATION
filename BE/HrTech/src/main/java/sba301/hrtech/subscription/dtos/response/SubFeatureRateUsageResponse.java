package sba301.hrtech.subscription.dtos.response;

import sba301.hrtech.subscription.entities.enums.ResetType;

import java.time.Instant;

public record SubFeatureRateUsageResponse(
    ResetType resetType,
    Integer capQuota,
    Integer used,
    Instant lastResetDate
) {}
