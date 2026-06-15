package sba301.hrtech.subscription.dtos.subscriptionPlan.response;

import lombok.Builder;

@Builder
public record PlanFeatureResponse(
        String code,
        String name,
        String description,
        Integer quota
) {
}
