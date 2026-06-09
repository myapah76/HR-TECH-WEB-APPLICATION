package sba301.hrtech.application.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.enums.ScoreGrade;
import sba301.hrtech.shared.common.BaseEntity;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "application_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationScore extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Enumerated(EnumType.STRING)
    private ScoreGrade grade;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private String aiSuggestion;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "scored_at")
    private Instant scoredAt;
}
