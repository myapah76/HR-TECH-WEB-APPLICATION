package sba301.hrtech.job.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.job.entities.JobSkill;
import java.util.UUID;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, UUID> {
}

