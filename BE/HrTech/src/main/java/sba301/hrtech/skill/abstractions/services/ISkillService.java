package sba301.hrtech.skill.abstractions.services;

import sba301.hrtech.skill.dtos.request.CreateSkillRequest;
import sba301.hrtech.skill.dtos.request.UpdateSkillRequest;
import sba301.hrtech.skill.dtos.response.PendingRelationshipResponse;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.dtos.response.SkillWithRelationsResponse;

import java.util.List;

public interface ISkillService {

    // CRUD
    SkillResponse createSkill(CreateSkillRequest request);
    SkillResponse updateSkill(String id, UpdateSkillRequest request);
    void deleteSkill(String id);
    SkillWithRelationsResponse getSkillById(String id);
    List<SkillResponse> getAllSkills();
    List<SkillResponse> searchSkills(String keyword);

    // Admin review
    List<SkillResponse> getPendingSkills();
    SkillResponse approveSkill(String id);
    void rejectSkill(String id);
    List<PendingRelationshipResponse> getPendingRelationships();
    void approvePendingRelationship(String sourceId, String targetId, String type);
    void rejectPendingRelationship(String sourceId, String targetId, String type);
    void addSynonym(String skillId, String synonymId);
    void addRelatedSkill(String skillId, String relatedSkillId);
    void addParentChild(String parentId, String childId);
    List<SkillResponse> getRelatedSkills(String skillId);

    // Embedding-based search
    List<SkillResponse> findSimilarSkills(String skillId, int topK);
}
