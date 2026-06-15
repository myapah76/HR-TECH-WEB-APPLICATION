package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.hrtech.subscription.entities.PlanFeature;

import java.util.UUID;

public interface PlanFeatureRepository extends JpaRepository<PlanFeature, UUID>
{
    void deleteByPlanId(UUID planId);
}
