package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
