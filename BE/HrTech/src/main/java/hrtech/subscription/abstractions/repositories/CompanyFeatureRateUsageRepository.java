package hrtech.subscription.abstractions.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CompanyFeatureRateUsage;
import hrtech.subscription.entities.enums.ResetType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyFeatureRateUsageRepository extends JpaRepository<CompanyFeatureRateUsage, UUID> {
    Optional<CompanyFeatureRateUsage> findByCompanyIdAndFeatureCodeAndResetType(UUID companyId, String featureCode, ResetType resetType);

    @Query("SELECT u.feature.name as name, SUM(u.used) as totalUsed " +
           "FROM CompanyFeatureRateUsage u " +
           "GROUP BY u.feature.name " +
           "ORDER BY SUM(u.used) DESC")
    List<Object[]> findFeatureUsages(Pageable pageable);
}
