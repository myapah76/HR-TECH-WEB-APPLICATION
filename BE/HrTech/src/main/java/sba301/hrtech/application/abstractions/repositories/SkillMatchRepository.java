package sba301.hrtech.application.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.application.entities.SkillMatch;
import java.util.UUID;

@Repository
public interface SkillMatchRepository extends JpaRepository<SkillMatch, UUID> {
}

