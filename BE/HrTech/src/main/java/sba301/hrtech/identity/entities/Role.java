package sba301.hrtech.identity.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.shared.common.SoftDeleteEntity;
import java.util.List;
import java.util.ArrayList;

@Entity
@Getter
@Setter
@Table(name = "roles")
public class Role extends SoftDeleteEntity {

    private String name;

    @Column(unique = true)
    private String slug;

    private String description;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private List<User> users = new ArrayList<>();
}
