package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CompanySubFeatureUsage;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubFeatureUsageRepository extends JpaRepository<CompanySubFeatureUsage, UUID> {
    Optional<CompanySubFeatureUsage> findBySubscriptionIdAndFeatureCode(UUID subscriptionId, String featureCode);
}
