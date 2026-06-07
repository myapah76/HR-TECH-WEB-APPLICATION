package sba301.hrtech.cv.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;
import sba301.hrtech.shared.enums.SkillLevel;

import java.math.BigDecimal;

@Entity
@Table(name = "cv_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;

    @Column(name = "skill_neo4j_id", nullable = false)
    private String skillNeo4jId;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level")
    private SkillLevel proficiencyLevel;


    @Column(name = "is_ai_extracted")
    private Boolean isAiExtracted;
}
