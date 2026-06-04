package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.abstractions.services.ISkillService;
import sba301.hrtech.skill.dtos.request.CreateSkillRequest;
import sba301.hrtech.skill.dtos.request.UpdateSkillRequest;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.dtos.response.SkillWithRelationsResponse;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.skill.mapper.SkillMapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillServiceImpl implements ISkillService {

    private final SkillNodeRepository skillNodeRepository;
    private final AiServiceClient aiServiceClient;
    private final SkillMapper skillMapper;

    @Override
    public SkillResponse createSkill(CreateSkillRequest request) {
        if (skillNodeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(HttpStatus.CONFLICT, ErrorCode.SKILL_ALREADY_EXISTS,
                    "Skill already exists: " + request.getName());
        }

        List<Double> embedding = aiServiceClient.generateEmbedding(request.getName());

        SkillNode skillNode = SkillNode.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .isVerified(true) // Admin-created skills are auto-verified
                .embedding(embedding)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        SkillNode saved = skillNodeRepository.save(skillNode);
        log.info("Created skill: {} (embedding dim: {})", saved.getName(),
                embedding != null ? embedding.size() : 0);
        return skillMapper.toResponse(saved);
    }

    @Override
    public SkillResponse updateSkill(String id, UpdateSkillRequest request) {
        SkillNode skillNode = findSkillOrThrow(id);

        boolean nameChanged = false;
        if (request.getName() != null && !request.getName().isBlank()) {
            skillNode.setName(request.getName());
            nameChanged = true;
        }
        if (request.getDescription() != null) {
            skillNode.setDescription(request.getDescription());
        }

        // Regenerate embedding if name changed
        if (nameChanged) {
            List<Double> newEmbedding = aiServiceClient.generateEmbedding(skillNode.getName());
            skillNode.setEmbedding(newEmbedding);
        }

        skillNode.setUpdatedAt(Instant.now());
        SkillNode saved = skillNodeRepository.save(skillNode);
        return skillMapper.toResponse(saved);
    }

    @Override
    public void deleteSkill(String id) {
        if (!skillNodeRepository.existsById(id)) {
            throw new AppException(HttpStatus.NOT_FOUND, ErrorCode.SKILL_NOT_FOUND,
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
        List<SkillNode> skills = skillNodeRepository.searchByKeyword(keyword);
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

    // === Relationships ===

    @Override
    public void addSynonym(String skillId, String synonymId) {
        validateRelationship(skillId, synonymId);
        SkillNode skill = findSkillOrThrow(skillId);
        SkillNode synonym = findSkillOrThrow(synonymId);

        if (skill.getSynonyms() == null) {
            skill.setSynonyms(new java.util.ArrayList<>());
        }
        skill.getSynonyms().add(synonym);
        skillNodeRepository.save(skill);
        log.info("Added synonym: {} <-> {}", skill.getName(), synonym.getName());
    }

    @Override
    public void addRelatedSkill(String skillId, String relatedSkillId) {
        validateRelationship(skillId, relatedSkillId);
        SkillNode skill = findSkillOrThrow(skillId);
        SkillNode related = findSkillOrThrow(relatedSkillId);

        if (skill.getRelatedSkills() == null) {
            skill.setRelatedSkills(new java.util.ArrayList<>());
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
            parent.setChildren(new java.util.ArrayList<>());
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

    // === Embedding-based Search ===

    @Override
    public List<SkillResponse> findSimilarSkills(String skillId, int topK) {
        SkillNode skill = findSkillOrThrow(skillId);

        if (skill.getEmbedding() == null || skill.getEmbedding().isEmpty()) {
            return List.of();
        }

        List<SkillNode> similar = skillNodeRepository.findSimilarByEmbedding(
                skill.getEmbedding(), topK + 1); // +1 to exclude self

        return similar.stream()
                .filter(s -> !s.getId().equals(skillId))
                .limit(topK)
                .map(skillMapper::toResponse)
                .toList();
    }

    // === Helpers ===

    private SkillNode findSkillOrThrow(String id) {
        return skillNodeRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.SKILL_NOT_FOUND, "Skill not found: " + id));
    }

    private void validateRelationship(String id1, String id2) {
        if (id1.equals(id2)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.SKILL_SELF_RELATIONSHIP,
                    "Cannot create relationship between a skill and itself");
        }
    }
}
