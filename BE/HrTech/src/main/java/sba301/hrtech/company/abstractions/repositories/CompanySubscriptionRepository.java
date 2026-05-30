package sba301.hrtech.company.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.CompanySubscription;
import java.util.UUID;

@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, UUID> {
}

