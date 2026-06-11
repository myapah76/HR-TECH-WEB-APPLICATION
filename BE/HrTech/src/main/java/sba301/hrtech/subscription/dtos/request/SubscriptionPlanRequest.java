package sba301.hrtech.subscription.dtos.request;

import sba301.hrtech.subscription.entities.enums.OwnerType;

import java.util.List;

public record SubscriptionPlanRequest(
        String name,
        String description,
        Long price,
        Integer durationDays,
        OwnerType ownerType,
        List<String> features,
        Boolean isActive
) {}
