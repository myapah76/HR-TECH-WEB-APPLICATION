package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CompanySubFeatureRateUsage;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanySubFeatureRateUsageRepository extends JpaRepository<CompanySubFeatureRateUsage, UUID> {
    List<CompanySubFeatureRateUsage> findByUsageId(UUID usageId);
}
