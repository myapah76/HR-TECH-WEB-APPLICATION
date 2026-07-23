package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CompanySubscriptionPlan;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionPlanRepository extends JpaRepository<CompanySubscriptionPlan, UUID> {
    List<CompanySubscriptionPlan> findByIsActiveTrue();
    List<CompanySubscriptionPlan> findByIsActiveTrueOrderByPriceAsc();
    List<CompanySubscriptionPlan> findAllByOrderByPriceAsc();
    Optional<CompanySubscriptionPlan> findByNameAndIsActiveTrue(String name);
    Optional<CompanySubscriptionPlan> findFirstByPriceAndIsActiveTrue(Long price);
}
