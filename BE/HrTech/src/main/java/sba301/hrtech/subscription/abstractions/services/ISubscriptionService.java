package sba301.hrtech.subscription.abstractions.services;

import sba301.hrtech.subscription.entities.Subscription;

import java.util.UUID;

public interface ISubscriptionService {
    Subscription createPendingSubscription(UUID userId, UUID planId);
}
