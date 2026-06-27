package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CompanySubscriptionPlan;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionPlanRepository extends JpaRepository<CompanySubscriptionPlan, UUID> {
    List<CompanySubscriptionPlan> findByIsActiveTrue();
    Optional<CompanySubscriptionPlan> findByNameAndIsActiveTrue(String name);
    Optional<CompanySubscriptionPlan> findFirstByPriceAndIsActiveTrue(Long price);
}
