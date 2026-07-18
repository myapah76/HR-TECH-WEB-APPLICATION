package hrtech.subscription.abstractions.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import hrtech.subscription.entities.CompanySubscription;
import hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, UUID> {
    List<CompanySubscription> findByCompanyIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID companyId, 
            SubscriptionStatus status, 
            Instant startDate,
            Instant endDate);

    @Query("SELECT s.plan.name as name, COUNT(s) as salesCount " +
           "FROM CompanySubscription s " +
           "GROUP BY s.plan.name " +
           "ORDER BY COUNT(s) DESC")
    List<Object[]> findTopSellingPlans(Pageable pageable);
}
