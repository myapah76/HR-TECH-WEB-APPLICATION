package sba301.hrtech.auth.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.shared.common.SoftDeleteEntity;

import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends SoftDeleteEntity {

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true)
    private String email;

    private String username;

    private String password;

    private String phone;

    private String address;

    private Integer gender;

    @Column(name = "date_of_birth")
    private OffsetDateTime dateOfBirth;

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "avatar_public_id")
    private String avatarPublicId;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
}
