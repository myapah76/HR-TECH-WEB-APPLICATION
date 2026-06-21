package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sba301.hrtech.subscription.entities.Subscription;
import sba301.hrtech.subscription.entities.enums.SubscriptionStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.status = :status AND s.endDate >= :currentDate ORDER BY s.endDate ASC")
    List<Subscription> findActiveSubscriptionsByUser(
            @Param("userId") UUID userId,
            @Param("status") SubscriptionStatus status,
            @Param("currentDate") LocalDate currentDate
    );
}
