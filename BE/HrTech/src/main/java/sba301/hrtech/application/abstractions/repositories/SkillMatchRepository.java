package sba301.hrtech.application.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.application.entities.SkillMatch;
import sba301.hrtech.application.entities.enums.MatchStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillMatchRepository extends JpaRepository<SkillMatch, UUID> {
    List<SkillMatch> findByApplicationScoreId(UUID applicationScoreId);
    List<SkillMatch> findByApplicationScoreIdAndMatchStatus(UUID applicationScoreId, MatchStatus matchStatus);
}