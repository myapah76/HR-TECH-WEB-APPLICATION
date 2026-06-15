package sba301.hrtech.job.entities;

import jakarta.persistence.*;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;
import sba301.hrtech.shared.enums.SkillLevel;

@Entity
@Table(name = "job_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "skill_neo4j_id", nullable = false)
    private String skillNeo4jId;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_level")
    private SkillLevel requiredLevel;

    @Column(name = "is_mandatory")
    private Boolean isMandatory;

}
