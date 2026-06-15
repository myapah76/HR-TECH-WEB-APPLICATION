package sba301.hrtech.subscription.dtos.subscriptionPlan.response;

import sba301.hrtech.subscription.entities.enums.PlanType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SubscriptionPlanResponse(
        UUID id,
        String name,
        String description,
        Long price,
        Integer durationDays,
        PlanType planType,
        Boolean isActive,
        List<PlanFeatureResponse> features
) {}
