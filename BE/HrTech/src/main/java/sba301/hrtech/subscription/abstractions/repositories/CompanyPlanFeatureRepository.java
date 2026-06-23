package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CompanyPlanFeature;
import java.util.UUID;

@Repository
public interface CompanyPlanFeatureRepository extends JpaRepository<CompanyPlanFeature, UUID> {
    void deleteByPlanId(UUID planId);
}
