package sba301.hrtech.cv.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.cv.entities.CvSkill;
import java.util.UUID;

@Repository
public interface CvSkillRepository extends JpaRepository<CvSkill, UUID> {
}

