package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CandidateSubscriptionPlan;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateSubscriptionPlanRepository extends JpaRepository<CandidateSubscriptionPlan, UUID> {
    List<CandidateSubscriptionPlan> findByIsActiveTrue();
    List<CandidateSubscriptionPlan> findByIsActiveTrueOrderByPriceAsc();
    List<CandidateSubscriptionPlan> findAllByOrderByPriceAsc();
    Optional<CandidateSubscriptionPlan> findByNameAndIsActiveTrue(String name);
    Optional<CandidateSubscriptionPlan> findFirstByPriceAndIsActiveTrue(Long price);
}
