package hrtech.subscription.dtos.response;

import java.util.List;

public record SubFeatureUsageResponse(
    String featureCode,
    String featureName,
    Integer aiCreditCost,
    Integer used,
    List<SubFeatureRateUsageResponse> rateLimits
) {}
