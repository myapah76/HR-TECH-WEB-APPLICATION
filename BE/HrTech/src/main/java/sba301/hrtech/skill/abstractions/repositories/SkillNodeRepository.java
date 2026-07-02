package sba301.hrtech.skill.abstractions.repositories;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.skill.dtos.response.PendingRelationshipResponse;
import sba301.hrtech.skill.entities.SkillNode;

import java.util.List;
import java.util.Optional;
import sba301.hrtech.skill.dtos.response.RelationshipResponse;

@Repository
public interface SkillNodeRepository extends Neo4jRepository<SkillNode, String> {

    @Query("MATCH (s:Skill) WHERE toLower(s.name) = toLower($name) RETURN s")
    Optional<SkillNode> findByNameIgnoreCase(@Param("name") String name);

    List<SkillNode> findByIsVerifiedFalse();

    List<SkillNode> findByIsVerifiedTrue();

    @Query("MATCH (s:Skill) WHERE s.is_verified = true AND ANY(r IN s.roles WHERE toLower(r) = toLower($role)) RETURN s.id")
    List<String> findIdsByRole(@Param("role") String role);

    @Query("MATCH (s:Skill) WHERE s.is_verified = true AND toLower(s.name) CONTAINS toLower($keyword) RETURN s.id LIMIT 50")
    List<String> findIdsByNameContaining(@Param("keyword") String keyword);

    @Query("MATCH (s:Skill) WHERE s.is_verified = true AND (s.name =~ ('(?i).*' + $keyword + '.*') OR ANY(role IN s.roles WHERE role =~ ('(?i).*' + $canonicalRole + '.*'))) RETURN s LIMIT 20")
    List<SkillNode> searchByKeywordAndRole(@Param("keyword") String keyword,
                                           @Param("canonicalRole") String canonicalRole);

    @Query("MATCH (s:Skill) WHERE s.id IN $ids RETURN s")
    List<SkillNode> findAllByIds(@Param("ids") List<String> ids);

    @Query("""
                MATCH (s:Skill {id: $skillId})-[r:RELATED_TO]-(related:Skill)
                WHERE related.id <> $skillId
                AND (r.status IS NULL OR r.status = 'APPROVED')
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
    void approvePendingRelationship(@Param("sourceId") String sourceId, @Param("targetId") String targetId,
                                    @Param("type") String type);

    @Query("""
                MATCH (s:Skill {id: $id})
                SET s.is_verified = true, s.updated_at = datetime()
            """)
    void approveSkillById(@Param("id") String id);

    @Query("""
                MATCH (s:Skill)
                WHERE s.is_verified = false OR s.is_verified IS NULL
                SET s.is_verified = true, s.updated_at = datetime()
            """)
    void approveAllPendingSkills();

    @Query("""
                MATCH (a:Skill)-[r]->(b:Skill)
                WHERE r.status = 'PENDING'
                SET r.status = 'APPROVED'
            """)
    void approveAllPendingRelationships();

    @Query("""
                MATCH (a:Skill {id: $sourceId})-[r]->(b:Skill {id: $targetId})
                WHERE type(r) = $type AND r.status = 'PENDING'
                DELETE r
            """)
    void rejectPendingRelationship(@Param("sourceId") String sourceId, @Param("targetId") String targetId,
                                   @Param("type") String type);

    @Query("""
                MATCH (a:Skill {id: $sourceId})
                WITH a
                MATCH (b:Skill {id: $targetId})
                MERGE (a)-[r:RELATED_TO {status: 'PENDING'}]-(b)
            """)
    void createPendingRelatedTo(@Param("sourceId") String sourceId, @Param("targetId") String targetId);

    @Query("MATCH (s:Skill) RETURN s.name")
    List<String> findAllNames();

    /**
     * Returns true if any relationship already exists between two nodes (in either
     * direction).
     * Used as a guard to prevent duplicate / conflicting relationships.
     */
    @Query("""
                MATCH (a:Skill) WHERE toLower(a.name) = toLower($nameA)
                MATCH (b:Skill) WHERE toLower(b.name) = toLower($nameB)
                RETURN EXISTS { MATCH (a)-[r]-(b) } AS exists
            """)
    Boolean anyRelationshipExistsByName(@Param("nameA") String nameA, @Param("nameB") String nameB);

    @Query("""
                MATCH (a:Skill) WHERE toLower(a.name) = toLower($sourceName)
                WITH a
                MATCH (b:Skill) WHERE toLower(b.name) = toLower($targetName)
                MERGE (a)-[r:RELATED_TO]->(b)
                ON CREATE SET r.status = 'PENDING'
            """)
    void createPendingRelatedToByName(@Param("sourceName") String sourceName, @Param("targetName") String targetName);

    @Query("""
                MATCH (parent:Skill) WHERE toLower(parent.name) = toLower($parentName)
                WITH parent
                MATCH (child:Skill) WHERE toLower(child.name) = toLower($childName)
                MERGE (parent)-[r:PARENT_OF]->(child)
                ON CREATE SET r.status = 'PENDING'
            """)
    void createPendingParentOfByName(@Param("parentName") String parentName, @Param("childName") String childName);

    @Query("MATCH (a:Skill)-[r]->(b:Skill) RETURN a.id AS sourceId, b.id AS targetId, type(r) AS type, COALESCE(r.status, 'APPROVED') AS status")
    List<RelationshipResponse> findAllRelationships();

    @Query("MATCH (a:Skill {id: $sourceId})-[r]->(b:Skill {id: $targetId}) WHERE type(r) = $type DELETE r")
    void deleteRelationship(@Param("sourceId") String sourceId, @Param("targetId") String targetId, @Param("type") String type);

    @Query("MATCH (s:Skill) WHERE $oldRole IN s.roles SET s.roles = [r IN s.roles WHERE r <> $oldRole] + $newRole")
    void renameRoleInSkills(@Param("oldRole") String oldRole, @Param("newRole") String newRole);

    @Query("MATCH (s:Skill) WHERE $role IN s.roles SET s.roles = [r IN s.roles WHERE r <> $role]")
    void removeRoleFromSkills(@Param("role") String role);
}
