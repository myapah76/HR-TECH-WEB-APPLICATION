package sba301.hrtech.application.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.application.entities.Application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByUserId(UUID userId);
    List<Application> findByJobId(UUID jobId);
    Optional<Application> findByInterviewResponseToken(String interviewResponseToken);
    boolean existsByUserIdAndJobId(UUID userId, UUID jobId);
}
