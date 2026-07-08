package hrtech.identity.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import hrtech.identity.entities.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findByEmailContains(String email);

    @Query("""
    SELECT u
    FROM User u
    JOIN u.role r
    WHERE (:roleName IS NULL OR r.name = :roleName)
      AND (:isBlocked IS NULL OR u.isBlocked = :isBlocked)
      AND (
          :email IS NULL
          OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:email AS string), '%'))
      )
    ORDER BY u.createdAt DESC
""")
    Page<User> findAdminUsers(
            @Param("roleName") String roleName,
            @Param("isBlocked") Boolean isBlocked,
            @Param("email") String email,
            Pageable pageable
    );

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findById(UUID id);

    List<User> findAll();

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
