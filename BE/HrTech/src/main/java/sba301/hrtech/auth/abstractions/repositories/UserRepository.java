package sba301.hrtech.auth.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.hrtech.auth.entities.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findByEmailContains(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findById(UUID id);

    List<User> findAll();

    User save(User user);

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
