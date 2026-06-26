package sba301.hrtech.subscription.dtos.response;

import java.util.List;

public record SubFeatureUsageResponse(
    String featureCode,
    String featureName,
    Integer quota,
    Integer used,
    List<SubFeatureRateUsageResponse> rateLimits
) {}
