package sba301.hrtech.interview.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.hrtech.interview.entities.InterviewSession;

import java.util.List;
import java.util.UUID;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
    List<InterviewSession> findByUser_Id(UUID userId);
}
