package hrtech.subscription.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import hrtech.subscription.entities.Feature;

import java.util.Optional;
import java.util.UUID;

public interface FeatureRepository extends JpaRepository<Feature, UUID> {
    boolean existsByCode(String code);

    Optional<Feature> findByCode(String code);
}
