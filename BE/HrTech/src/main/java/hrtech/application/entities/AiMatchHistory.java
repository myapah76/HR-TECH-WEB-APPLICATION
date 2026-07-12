package hrtech.application.entities;

import jakarta.persistence.*;
import lombok.*;
import hrtech.shared.common.BaseEntity;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "ai_match_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMatchHistory extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "cv_id", nullable = false)
    private UUID cvId;

    @Column(name = "job_id", nullable = false)
    private UUID jobId;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "improvement_tips", columnDefinition = "TEXT")
    private String improvementTips;

    @Column(name = "action_plan", columnDefinition = "TEXT")
    private String actionPlan;

    @Builder.Default
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}
