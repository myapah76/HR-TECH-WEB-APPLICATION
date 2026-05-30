package sba301.hrtech.subscription.entities;

import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import sba301.hrtech.subscription.entities.enums.PlanType;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan extends SoftDeleteEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type")
    private PlanType planType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String features;

    @Column(name = "is_active")
    private Boolean isActive;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateSubscription> candidateSubscriptions = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanySubscription> companySubscriptions = new ArrayList<>();
}






