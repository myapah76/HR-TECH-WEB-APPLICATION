package sba301.hrtech.subscription.abstractions.services;

import sba301.hrtech.subscription.dtos.response.MySubscriptionResponse;

import java.util.UUID;

import sba301.hrtech.subscription.entities.enums.SubscriptionType;

public interface ISubscriptionService {
    MySubscriptionResponse getMyCurrentSubscription();
    String getSubscriptionPlanName(UUID subscriptionId, SubscriptionType type);
    void createAndActivateFreeSubscription(UUID userId);
    void createAndActivateFreeCompanySubscription(UUID companyId, UUID userId);
    void checkRenewalEligibility(UUID userId, UUID planId);
    void createAndActivateSubscription(UUID userId, UUID planId, SubscriptionType type);
}