package sba301.hrtech.subscription.dtos.response;

import sba301.hrtech.subscription.entities.enums.OwnerType;

import java.util.List;
import java.util.UUID;

public record SubscriptionPlanResponse(
        UUID id,
        String name,
        String description,
        Long price,
        Integer durationDays,
        OwnerType ownerType,
        List<String> features,
        Boolean isActive
) {}
