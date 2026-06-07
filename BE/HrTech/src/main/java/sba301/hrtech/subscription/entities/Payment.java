package sba301.hrtech.subscription.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;
import sba301.hrtech.subscription.entities.enums.PaymentMethod;
import sba301.hrtech.subscription.entities.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import sba301.hrtech.auth.entities.User;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cand_subscription_id")
    private CandidateSubscription candidateSubscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comp_subscription_id")
    private CompanySubscription companySubscription;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "paid_at")
    private Instant paidAt;

    // VNPay
    @Column(nullable = false, unique = true)
    private String txnRef;
    private String responseCode;  // vnp_ResponseCode
    private String transactionNo; // vnp_TransactionNo
    private String bankCode;      // vnp_BankCode
    private LocalDateTime payDate;// vnp_PayDate

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
