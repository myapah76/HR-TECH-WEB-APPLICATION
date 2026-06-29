package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CandidateFeatureRateUsage;
import sba301.hrtech.subscription.entities.enums.ResetType;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateFeatureRateUsageRepository extends JpaRepository<CandidateFeatureRateUsage, UUID> {
    Optional<CandidateFeatureRateUsage> findByUserIdAndFeatureCodeAndResetType(UUID userId, String featureCode, ResetType resetType);
}
