package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CandidatePlanFeature;
import java.util.UUID;

@Repository
public interface CandidatePlanFeatureRepository extends JpaRepository<CandidatePlanFeature, UUID> {
    void deleteByPlanId(UUID planId);
}
