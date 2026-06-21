package sba301.hrtech.interview.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.hrtech.interview.entities.InterviewAnswer;

import java.util.UUID;

public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, UUID> {
}
