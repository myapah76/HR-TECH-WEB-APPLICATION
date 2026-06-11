package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.SubscriptionPlan;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {
    List<SubscriptionPlan> findByIsActiveTrue();

    List<SubscriptionPlan> findByDeletedIsFalse();
}

