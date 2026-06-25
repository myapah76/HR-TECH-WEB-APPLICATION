package sba301.hrtech.subscription.dtos.response;

public record SubFeatureUsageResponse(
    String featureCode,
    String featureName,
    Integer quota,
    Integer used
) {}
