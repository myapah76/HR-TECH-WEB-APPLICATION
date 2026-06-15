package sba301.hrtech.subscription.entities;

import sba301.hrtech.shared.common.SoftDeleteEntity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import sba301.hrtech.subscription.entities.enums.OwnerType;

import java.util.List;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    @Column(name = "plan_type")
    private OwnerType ownerType;

    // Quotas
    @Column(name = "max_job_posts")
    private Integer maxJobPosts;

    @Column(name = "max_recruiters")
    private Integer maxRecruiters;

    @Column(name = "max_ai_cv_ratings")
    private Integer maxAiCvRatings;

    // Feature toggles
    @Column(name = "candidate_pool_access")
    private Boolean candidatePoolAccess;

    @Column(name = "analytics_access")
    private Boolean analyticsAccess;

    @Column(name = "is_active")
    private Boolean isActive;
}