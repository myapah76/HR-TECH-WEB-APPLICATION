package sba301.hrtech.skill.abstractions.repositories;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.skill.entities.SkillNode;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillNodeRepository extends Neo4jRepository<SkillNode, String> {

    Optional<SkillNode> findByNameIgnoreCase(String name);

    List<SkillNode> findByIsVerifiedFalse();

    List<SkillNode> findByIsVerifiedTrue();

    @Query("MATCH (s:Skill) WHERE s.name =~ ('(?i).*' + $keyword + '.*') RETURN s LIMIT 20")
    List<SkillNode> searchByKeyword(@Param("keyword") String keyword);

    @Query("MATCH (s:Skill) WHERE s.id IN $ids RETURN s")
    List<SkillNode> findAllByIds(@Param("ids") List<String> ids);

    @Query("""
        MATCH (s:Skill {id: $skillId})-[:SYNONYM]-(synonym:Skill)
        RETURN DISTINCT synonym
    """)
    List<SkillNode> findSynonyms(@Param("skillId") String skillId);

    @Query("""
        MATCH (s:Skill {id: $skillId})-[:RELATED_TO*1..2]-(related:Skill)
        WHERE related.id <> $skillId AND NOT (s)-[:SYNONYM]-(related)
        RETURN DISTINCT related
    """)
    List<SkillNode> findRelatedSkills(@Param("skillId") String skillId);

    @Query("""
        MATCH (s:Skill {id: $skillId})-[:PARENT_OF*1..2]-(family:Skill)
        WHERE family.id <> $skillId
        RETURN DISTINCT family
    """)
    List<SkillNode> findParentsAndChildren(@Param("skillId") String skillId);

    @Query("""
        CALL db.index.vector.queryNodes('skill_embedding_index', $topK, $queryVector)
        YIELD node AS skill, score
        RETURN skill
    """)
    List<SkillNode> findSimilarByEmbedding(
            @Param("queryVector") List<Double> queryVector,
            @Param("topK") int topK
    );

    boolean existsByNameIgnoreCase(String name);
}
