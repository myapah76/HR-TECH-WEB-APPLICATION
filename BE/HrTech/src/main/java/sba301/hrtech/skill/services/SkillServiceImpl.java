package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.RoleAliasRepository;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.entities.RoleAlias;
import sba301.hrtech.skill.abstractions.services.ISkillService;
import sba301.hrtech.skill.dtos.request.CreateSkillRequest;
import sba301.hrtech.skill.dtos.request.UpdateSkillRequest;
import sba301.hrtech.skill.dtos.response.PendingRelationshipResponse;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.dtos.response.SkillWithRelationsResponse;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.skill.mapper.SkillMapper;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillServiceImpl implements ISkillService {

    private final SkillNodeRepository skillNodeRepository;
    private final RoleAliasRepository roleAliasRepository;
    private final SkillMapper skillMapper;

    @Override
    public SkillResponse createSkill(CreateSkillRequest request) {
        if (skillNodeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.SKILL_ALREADY_EXISTS,
                    "Skill already exists: " + request.getName());
        }

        SkillNode skillNode = SkillNode.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName().trim().toLowerCase())
                .description(request.getDescription())
                .roles(request.getRoles() != null ? request.getRoles() : new ArrayList<>())
                .isVerified(true) // Admin-created skills are auto-verified
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        SkillNode saved = skillNodeRepository.save(skillNode);
        log.info("Created skill: {}", saved.getName());
        return skillMapper.toResponse(saved);
    }

    @Override
    public SkillResponse updateSkill(String id, UpdateSkillRequest request) {
        SkillNode skillNode = findSkillOrThrow(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            skillNode.setName(request.getName().trim().toLowerCase());
        }
        if (request.getDescription() != null) {
            skillNode.setDescription(request.getDescription());
        }
        if (request.getRoles() != null) {
            skillNode.setRoles(request.getRoles());
        }

        skillNode.setUpdatedAt(Instant.now());
        SkillNode saved = skillNodeRepository.save(skillNode);
        return skillMapper.toResponse(saved);
    }

    @Override
    public void deleteSkill(String id) {
        if (!skillNodeRepository.existsById(id)) {
            throw new AppException(ErrorCode.SKILL_NOT_FOUND,
                    "Skill not found: " + id);
        }
        skillNodeRepository.deleteById(id);
        log.info("Deleted skill: {}", id);
    }

    @Override
    public SkillWithRelationsResponse getSkillById(String id) {
        SkillNode skillNode = findSkillOrThrow(id);
        return skillMapper.toRelationsResponse(skillNode);
    }

    @Override
    public List<SkillResponse> getAllSkills() {
        List<SkillNode> skills = skillNodeRepository.findByIsVerifiedTrue();
        return skillMapper.toResponseList(skills);
    }

    @Override
    public List<SkillResponse> searchSkills(String keyword) {
        String safeKeyword = keyword != null ? keyword.trim() : "";
        String canonicalRole = safeKeyword;
        
        Optional<RoleAlias> alias = roleAliasRepository.findByAliasIgnoreCase(safeKeyword);
        if (alias.isPresent()) {
            canonicalRole = alias.get().getCanonicalRole();
        }

        List<SkillNode> skills = skillNodeRepository.searchByKeywordAndRole(safeKeyword, canonicalRole);
        return skillMapper.toResponseList(skills);
    }

    // === Admin Review ===

    @Override
    public List<SkillResponse> getPendingSkills() {
        List<SkillNode> pending = skillNodeRepository.findByIsVerifiedFalse();
        return skillMapper.toResponseList(pending);
    }

    @Override
    public SkillResponse approveSkill(String id) {
        SkillNode skillNode = findSkillOrThrow(id);
        skillNode.setIsVerified(true);
        skillNode.setUpdatedAt(Instant.now());
        SkillNode saved = skillNodeRepository.save(skillNode);
        log.info("Approved skill: {}", saved.getName());
        return skillMapper.toResponse(saved);
    }

    @Override
    public void rejectSkill(String id) {
        SkillNode skillNode = findSkillOrThrow(id);
        skillNodeRepository.delete(skillNode);
        log.info("Rejected and deleted skill: {}", skillNode.getName());
    }

    @Override
    public List<PendingRelationshipResponse> getPendingRelationships() {
        return skillNodeRepository.getPendingRelationships();
    }

    @Override
    public void approvePendingRelationship(String sourceId, String targetId, String type) {
        if (!type.equals("PARENT_OF") && !type.equals("RELATED_TO")) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Invalid relationship type");
        }

        skillNodeRepository.approvePendingRelationship(sourceId, targetId, type);
        log.info("Approved {} between {} and {}", type, sourceId, targetId);
    }

    @Override
    public void rejectPendingRelationship(String sourceId, String targetId, String type) {
        if (!type.equals("PARENT_OF") && !type.equals("RELATED_TO")) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Invalid relationship type");
        }

        skillNodeRepository.rejectPendingRelationship(sourceId, targetId, type);
        log.info("Rejected {} between {} and {}", type, sourceId, targetId);
    }

    // === Relationships ===
    @Override
    public void addRelatedSkill(String skillId, String relatedSkillId) {
        validateRelationship(skillId, relatedSkillId);
        SkillNode skill = findSkillOrThrow(skillId);
        SkillNode related = findSkillOrThrow(relatedSkillId);

        if (skill.getRelatedSkills() == null) {
            skill.setRelatedSkills(new ArrayList<>());
        }
        skill.getRelatedSkills().add(related);
        skillNodeRepository.save(skill);
        log.info("Added related: {} <-> {}", skill.getName(), related.getName());
    }

    @Override
    public void addParentChild(String parentId, String childId) {
        validateRelationship(parentId, childId);
        SkillNode parent = findSkillOrThrow(parentId);
        SkillNode child = findSkillOrThrow(childId);

        if (parent.getChildren() == null) {
            parent.setChildren(new ArrayList<>());
        }
        parent.getChildren().add(child);
        skillNodeRepository.save(parent);
        log.info("Added parent-child: {} -> {}", parent.getName(), child.getName());
    }

    @Override
    public List<SkillResponse> getRelatedSkills(String skillId) {
        findSkillOrThrow(skillId);
        List<SkillNode> related = skillNodeRepository.findRelatedSkills(skillId);
        return skillMapper.toResponseList(related);
    }

    // === Helpers ===

    private SkillNode findSkillOrThrow(String id) {
        return skillNodeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKILL_NOT_FOUND, "Skill not found: " + id));
    }

    private void validateRelationship(String id1, String id2) {
        if (id1.equals(id2)) {
            throw new AppException(ErrorCode.SKILL_SELF_RELATIONSHIP,
                    "Cannot create relationship between a skill and itself");
        }
    }
}
