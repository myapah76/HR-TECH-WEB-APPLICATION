package hrtech.payment.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import hrtech.payment.entities.Payment;
import hrtech.payment.entities.enums.PaymentStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByOrderCode(Long orderCode);
    List<Payment> findAllByStatusAndCreatedAtAfter(PaymentStatus status, Instant dateTime);
    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    boolean existsByUserIdAndStatus(UUID userId, PaymentStatus status);
    Optional<Payment> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PaymentStatus status);
}

