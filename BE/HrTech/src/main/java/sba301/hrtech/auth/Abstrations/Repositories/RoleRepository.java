package sba301.hrtech.auth.Abstrations.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.auth.Domain.Entities.Role;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String name);

    Optional<Role> findBySlug(String slug);

    Optional<Role> findById(UUID id);

    List<Role> findAll();

    Role save(Role role);

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
