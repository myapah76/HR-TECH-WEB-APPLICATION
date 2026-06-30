package sba301.hrtech.subscription.abstractions.services;

import sba301.hrtech.subscription.dtos.response.MySubscriptionResponse;

import java.util.UUID;

import sba301.hrtech.subscription.entities.enums.SubscriptionType;

public interface ISubscriptionService {
    Object createPendingSubscription(UUID userId, UUID planId);
    MySubscriptionResponse getMyCurrentSubscription();
    void activateSubscription(UUID subscriptionId, SubscriptionType type);
    String getSubscriptionPlanName(UUID subscriptionId, SubscriptionType type);
    void createAndActivateFreeSubscription(UUID userId);
    void createAndActivateFreeCompanySubscription(UUID companyId, UUID userId);
    UUID getSubscriptionPlanId(UUID subscriptionId, SubscriptionType type);
}