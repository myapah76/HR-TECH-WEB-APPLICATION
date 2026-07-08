package hrtech.payment.entities;

import jakarta.persistence.*;
import lombok.*;
import hrtech.shared.common.BaseEntity;
import hrtech.payment.entities.enums.PaymentStatus;
import hrtech.subscription.entities.enums.SubscriptionType;

import hrtech.identity.entities.User;

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

    private String checkoutUrl;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "subscription_plan_id")
    private UUID subscriptionPlanId;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
