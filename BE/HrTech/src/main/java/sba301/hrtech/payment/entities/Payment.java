package sba301.hrtech.payment.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;
import sba301.hrtech.payment.entities.enums.PaymentStatus;
import sba301.hrtech.subscription.entities.enums.SubscriptionType;

import sba301.hrtech.identity.entities.User;

import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Column(unique = true, nullable = false)
    private Long orderCode;

    private Long amount;

    private String paymentLinkId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
