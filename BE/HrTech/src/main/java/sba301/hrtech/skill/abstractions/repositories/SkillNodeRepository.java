package sba301.hrtech.skill.abstractions.repositories;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.skill.entities.SkillNode;

@Repository
public interface SkillNodeRepository extends Neo4jRepository<SkillNode, String> {
}

