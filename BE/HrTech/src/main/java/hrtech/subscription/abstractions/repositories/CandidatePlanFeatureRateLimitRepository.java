package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CandidatePlanFeatureRateLimit;

import java.util.UUID;

@Repository
public interface CandidatePlanFeatureRateLimitRepository extends JpaRepository<CandidatePlanFeatureRateLimit, UUID> {
}
