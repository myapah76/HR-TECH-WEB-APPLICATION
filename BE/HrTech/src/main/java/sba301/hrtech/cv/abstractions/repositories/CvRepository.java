package sba301.hrtech.cv.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.cv.entities.Cv;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvRepository extends JpaRepository<Cv, UUID> {


    List<Cv> findByUserId(UUID userId);


    Optional<Cv> findByUserIdAndIsPrimaryTrue(UUID userId);
}