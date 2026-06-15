package sba301.hrtech.subscription.dtos.subscriptionPlan.request;

import sba301.hrtech.subscription.entities.enums.PlanType;

import java.util.List;

public record SubscriptionPlanRequest(
        String name,
        String description,
        Long price,
        Integer durationDays,
        PlanType planType,
        Boolean isActive,
        List<PlanFeatureRequest> features
) {}
