package hrtech.subscription.dtos.subscriptionPlan.response;

import hrtech.subscription.entities.enums.SubscriptionType;

import java.util.List;
import java.util.UUID;

public record SubscriptionPlanResponse(
                UUID id,
                String name,
                String description,
                Long price,
                Integer durationDays,
                SubscriptionType subscriptionType,
                Boolean isActive,
                Integer aiCreditBalance,
                Integer jobPostBalance,
                Integer dailyAiLimit,
                Integer weeklyAiLimit,
                List<PlanFeatureResponse> features) {
}
