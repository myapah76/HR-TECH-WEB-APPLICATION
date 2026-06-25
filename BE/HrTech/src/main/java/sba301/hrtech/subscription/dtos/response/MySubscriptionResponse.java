package sba301.hrtech.subscription.dtos.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

public record MySubscriptionResponse(
    UUID id,
    UUID planId,
    String planName,
    SubscriptionStatus status,
    LocalDate startDate,
    LocalDate endDate,
    List<SubFeatureUsageResponse> featuresUsage
) {}
