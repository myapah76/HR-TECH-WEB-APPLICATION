package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.hrtech.subscription.entities.Subscription;

import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
}
