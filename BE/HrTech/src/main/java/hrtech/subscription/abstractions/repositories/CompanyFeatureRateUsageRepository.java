package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CompanyFeatureRateUsage;
import hrtech.subscription.entities.enums.ResetType;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyFeatureRateUsageRepository extends JpaRepository<CompanyFeatureRateUsage, UUID> {
    Optional<CompanyFeatureRateUsage> findByCompanyIdAndFeatureCodeAndResetType(UUID companyId, String featureCode, ResetType resetType);
}
