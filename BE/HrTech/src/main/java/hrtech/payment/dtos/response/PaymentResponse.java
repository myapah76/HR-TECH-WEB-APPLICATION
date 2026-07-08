package hrtech.payment.dtos.response;

import java.time.Instant;
import hrtech.payment.entities.enums.PaymentStatus;

public record PaymentResponse(
    Long orderCode,
    Long amount,
    PaymentStatus status,
    String subscriptionName,
    Instant createdAt,
    String checkoutUrl
) {}
