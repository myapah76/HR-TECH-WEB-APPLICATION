package sba301.hrtech.application.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.application.entities.ApplicationScore;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationScoreRepository extends JpaRepository<ApplicationScore, UUID> {
    Optional<ApplicationScore> findByApplicationId(UUID applicationId);
    boolean existsByApplicationId(UUID applicationId);
}