package hrtech.application.entities;

import jakarta.persistence.*;
import lombok.*;
import hrtech.application.entities.enums.MatchStatus;
import hrtech.application.entities.enums.MatchType;
import hrtech.shared.common.BaseEntity;
import hrtech.shared.enums.SkillLevel;

import java.math.BigDecimal;

@Entity
@Table(name = "skill_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillMatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_score_id", nullable = false)
    private ApplicationScore applicationScore;

    @Column(name = "skill_neo4j_id", nullable = false)
    private String skillNeo4jId;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_level")
    private SkillLevel requiredLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "candidate_level")
    private SkillLevel candidateLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status")
    private MatchStatus matchStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type")
    private MatchType matchType;

    @Column(precision = 3, scale = 2)
    private BigDecimal weight;

    @Column(name = "is_mandatory")
    private Boolean isMandatory;

    @Column(name = "matched_by_neo4j_id")
    private String matchedByNeo4jId;
}
