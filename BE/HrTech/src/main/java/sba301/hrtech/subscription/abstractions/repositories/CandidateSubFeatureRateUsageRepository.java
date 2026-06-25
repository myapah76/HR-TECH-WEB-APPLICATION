package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CandidateSubFeatureRateUsage;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateSubFeatureRateUsageRepository extends JpaRepository<CandidateSubFeatureRateUsage, UUID> {
    List<CandidateSubFeatureRateUsage> findByUsageId(UUID usageId);
}
