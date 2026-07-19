package hrtech.subscription.dtos.subscriptionPlan.request;

import hrtech.subscription.entities.enums.SubscriptionType;

import java.util.List;

public record SubscriptionPlanRequest(
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
        List<PlanFeatureRequest> features
) {}
