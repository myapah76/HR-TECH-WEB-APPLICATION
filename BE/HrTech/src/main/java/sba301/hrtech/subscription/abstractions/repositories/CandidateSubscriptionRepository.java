package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CandidateSubscription;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateSubscriptionRepository extends JpaRepository<CandidateSubscription, UUID> {
    List<CandidateSubscription> findByUserIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID userId, 
            SubscriptionStatus status, 
            Instant startDate,
            Instant endDate);
}
