package hrtech.skill.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import hrtech.shared.common.BaseEntity;

@Entity
@Table(name = "role_aliases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleAlias extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String alias;

    @Column(name = "canonical_role", nullable = false)
    private String canonicalRole;
}
