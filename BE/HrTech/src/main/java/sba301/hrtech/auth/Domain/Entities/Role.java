package sba301.hrtech.auth.Domain.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.shared.Common.SoftDeleteEntity;

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