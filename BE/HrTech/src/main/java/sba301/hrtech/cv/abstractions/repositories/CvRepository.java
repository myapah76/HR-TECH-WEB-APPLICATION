package sba301.hrtech.cv.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.shared.enums.ExtractionStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvRepository extends JpaRepository<Cv, UUID> {

    @Query("SELECT c FROM Cv c WHERE c.user.id = :userId ORDER BY c.isPrimary DESC, c.createdAt DESC")
    List<Cv> findByUserId(@Param("userId") UUID userId);
    Optional<Cv> findByUserIdAndIsPrimaryTrue(UUID userId);
    @Query("SELECT c FROM Cv c WHERE c.user.id = :userId AND c.fileHash = :fileHash")
    Optional<Cv> findByUserIdAndFileHash(@Param("userId") UUID userId, @Param("fileHash") String fileHash);

    @Query("SELECT c FROM Cv c WHERE c.extractionStatus IN :statuses AND c.updatedAt < :threshold")
    List<Cv> findStuckCvs(
            @Param("statuses") List<ExtractionStatus> statuses,
            @Param("threshold") Instant threshold);
}