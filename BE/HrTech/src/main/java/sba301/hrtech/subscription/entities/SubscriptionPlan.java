package sba301.hrtech.subscription.entities;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.subscription.entities.enums.PlanType;

import java.util.List;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE subscription_plans SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class SubscriptionPlan extends SoftDeleteEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private Long price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType planType;

    @Column(name = "is_active")
    private Boolean isActive;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanFeature> planFeatures;
}