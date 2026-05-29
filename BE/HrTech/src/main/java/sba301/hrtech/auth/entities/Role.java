package sba301.hrtech.auth.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.shared.common.SoftDeleteEntity;

@Entity
@Getter
@Setter
@Table(name = "roles")
public class Role extends SoftDeleteEntity {

    private String name;

    @Column(unique = true)
    private String slug;

    private String description;

}
