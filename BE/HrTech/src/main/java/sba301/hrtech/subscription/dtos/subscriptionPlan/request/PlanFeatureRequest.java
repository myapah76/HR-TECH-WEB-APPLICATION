package sba301.hrtech.subscription.dtos.subscriptionPlan.request;

import java.util.UUID;

public record PlanFeatureRequest(
        UUID id,
        Integer quota
) {
}
