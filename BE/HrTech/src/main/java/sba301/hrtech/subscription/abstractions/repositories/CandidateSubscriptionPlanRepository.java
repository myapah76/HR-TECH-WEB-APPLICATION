package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CandidateSubscriptionPlan;
import java.util.UUID;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSubscriptionPlanRepository extends JpaRepository<CandidateSubscriptionPlan, UUID> {
    List<CandidateSubscriptionPlan> findByIsActiveTrue();
    Optional<CandidateSubscriptionPlan> findByNameAndIsActiveTrue(String name);
}
