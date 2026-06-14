package sba301.hrtech.skill.abstractions.repositories;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.skill.dtos.response.PendingRelationshipResponse;
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
        MATCH (s:Skill {id: $skillId})-[r:RELATED_TO*1..2]-(related:Skill)
        WHERE related.id <> $skillId
        AND all(rel IN r WHERE rel.status IS NULL OR rel.status = 'APPROVED')
        RETURN DISTINCT related
    """)
    List<SkillNode> findRelatedSkills(@Param("skillId") String skillId);

    @Query("""
        MATCH (s:Skill {id: $skillId})<-[r:PARENT_OF*1..2]-(parent:Skill)
        WHERE parent.id <> $skillId
        RETURN DISTINCT parent
    """)
    List<SkillNode> findParents(@Param("skillId") String skillId);

    @Query("""
        MATCH (s:Skill {id: $skillId})-[r:PARENT_OF*1..2]->(child:Skill)
        WHERE child.id <> $skillId
        RETURN DISTINCT child
    """)
    List<SkillNode> findChildren(@Param("skillId") String skillId);

    boolean existsByNameIgnoreCase(String name);

    @Query("""
        MATCH (a:Skill)-[r]->(b:Skill)
        WHERE r.status = 'PENDING'
        RETURN a.id AS sourceSkillId, a.name AS sourceSkillName,
               b.id AS targetSkillId, b.name AS targetSkillName, type(r) AS relationshipType
    """)
    List<PendingRelationshipResponse> getPendingRelationships();

    @Query("""
        MATCH (a:Skill {id: $sourceId})-[r]->(b:Skill {id: $targetId})
        WHERE type(r) = $type AND r.status = 'PENDING'
        SET r.status = 'APPROVED'
    """)
    void approvePendingRelationship(@Param("sourceId") String sourceId, @Param("targetId") String targetId, @Param("type") String type);

    @Query("""
        MATCH (a:Skill {id: $sourceId})-[r]->(b:Skill {id: $targetId})
        WHERE type(r) = $type AND r.status = 'PENDING'
        DELETE r
    """)
    void rejectPendingRelationship(@Param("sourceId") String sourceId, @Param("targetId") String targetId, @Param("type") String type);

    @Query("""
        MATCH (a:Skill {id: $sourceId})
        WITH a
        MATCH (b:Skill {id: $targetId})
        MERGE (a)-[r:RELATED_TO {status: 'PENDING'}]-(b)
    """)
    void createPendingRelatedTo(@Param("sourceId") String sourceId, @Param("targetId") String targetId);

    @Query("MATCH (s:Skill) RETURN s.name")
    List<String> findAllNames();

    @Query("""
        MATCH (a:Skill {name: $sourceName})
        WITH a
        MATCH (b:Skill {name: $targetName})
        MERGE (a)-[r:RELATED_TO {status: 'PENDING'}]-(b)
    """)
    void createPendingRelatedToByName(@Param("sourceName") String sourceName, @Param("targetName") String targetName);

    @Query("""
        MATCH (parent:Skill {name: $parentName})
        WITH parent
        MATCH (child:Skill {name: $childName})
        MERGE (parent)-[r:PARENT_OF {status: 'PENDING'}]->(child)
    """)
    void createPendingParentOfByName(@Param("parentName") String parentName, @Param("childName") String childName);
}
