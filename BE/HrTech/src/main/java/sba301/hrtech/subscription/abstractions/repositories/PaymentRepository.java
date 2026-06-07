package sba301.hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.subscription.entities.Payment;
import sba301.hrtech.subscription.entities.enums.PaymentMethod;
import sba301.hrtech.subscription.entities.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByTxnRef(String txnRef);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findByPaymentMethod(PaymentMethod method);
    Optional<Payment> findPaymentByCandidateSubscription_Id(UUID candidateSubscription_id);
    Optional<Payment> findPaymentByCompanySubscription_Id(UUID companySubscription_id);

}

