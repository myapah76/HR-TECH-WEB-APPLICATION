package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CompanyPlanFeatureRateLimit;

import java.util.UUID;

@Repository
public interface CompanyPlanFeatureRateLimitRepository extends JpaRepository<CompanyPlanFeatureRateLimit, UUID> {
}
