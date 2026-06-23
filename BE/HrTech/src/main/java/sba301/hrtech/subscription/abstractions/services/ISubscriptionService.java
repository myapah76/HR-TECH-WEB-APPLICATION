package sba301.hrtech.subscription.abstractions.services;

import java.util.UUID;

public interface ISubscriptionService {
    Object createPendingSubscription(UUID userId, UUID planId);
}
