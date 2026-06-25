package sba301.hrtech.subscription.abstractions.services;

import sba301.hrtech.subscription.dtos.response.MySubscriptionResponse;

import java.util.UUID;

public interface ISubscriptionService {
    Object createPendingSubscription(UUID userId, UUID planId);
    MySubscriptionResponse getMyCurrentSubscription();
}
