package sba301.hrtech.subscription.dtos.request;

import jakarta.persistence.Column;
import sba301.hrtech.subscription.entities.enums.OwnerType;

import java.util.List;

public record SubscriptionPlanRequest(
        String name,
        String description,
        Long price,
        Integer durationDays,
        OwnerType ownerType,
        Integer maxJobPosts,
        Integer maxRecruiters,
        Integer maxAiCvRatings,
        Boolean candidatePoolAccess,
        Boolean analyticsAccess,
        Boolean isActive
) {}
