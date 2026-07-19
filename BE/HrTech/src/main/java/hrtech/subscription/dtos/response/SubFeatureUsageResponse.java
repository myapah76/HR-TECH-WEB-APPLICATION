package hrtech.subscription.dtos.response;

public record SubFeatureUsageResponse(
    String featureCode,
    String featureName,
    Integer aiCreditCost
) {}
