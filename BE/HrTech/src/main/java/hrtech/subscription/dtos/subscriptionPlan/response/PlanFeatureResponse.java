package hrtech.subscription.dtos.subscriptionPlan.response;

import lombok.Builder;

@Builder
public record PlanFeatureResponse(
        String code,
        String name,
        String description,
        Integer aiCreditCost
) {
}
