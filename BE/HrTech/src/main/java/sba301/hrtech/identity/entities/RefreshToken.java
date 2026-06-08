package sba301.hrtech.identity.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import sba301.hrtech.shared.common.BaseEntity;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
public class RefreshToken extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String token;

    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "is_revoked")
    private Boolean isRevoked = false;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
