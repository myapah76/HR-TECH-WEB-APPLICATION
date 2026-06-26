package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CandidateSubFeatureUsage;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateSubFeatureUsageRepository extends JpaRepository<CandidateSubFeatureUsage, UUID> {
    Optional<CandidateSubFeatureUsage> findBySubscriptionIdAndFeatureCode(UUID subscriptionId, String featureCode);
    java.util.List<CandidateSubFeatureUsage> findBySubscriptionId(UUID subscriptionId);
}
