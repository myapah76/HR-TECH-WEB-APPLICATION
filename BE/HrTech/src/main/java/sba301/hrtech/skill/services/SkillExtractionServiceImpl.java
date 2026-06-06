package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.abstractions.repositories.CvSkillRepository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.enums.SkillLevel;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;
import sba301.hrtech.skill.dtos.response.CvExtractionResponse;
import sba301.hrtech.skill.dtos.response.ExtractedSkillDto;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.skill.mapper.SkillMapper;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillExtractionServiceImpl implements ISkillExtractionService {

    private final CvRepository cvRepository;
    private final CvSkillRepository cvSkillRepository;
    private final SkillNodeRepository skillNodeRepository;
    private final AiServiceClient aiServiceClient;
    private final SkillMapper skillMapper;

    @Override
    @Transactional
    public CvExtractionResponse extractAndSaveSkills(UUID cvId) {
        // 1. Get CV from PostgreSQL
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.CV_NOT_FOUND, "CV not found: " + cvId));

        String cvText = cv.getParsedContent();
        if (cvText == null || cvText.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    ErrorCode.CV_CONTENT_EMPTY, "CV has no parsed content");
        }

        // 2. Call Gemini AI to extract skills
        List<ExtractedSkillDto> aiExtracted = aiServiceClient.extractSkillsFromText(cvText);
        log.info("Gemini extracted {} skills from CV {}", aiExtracted.size(), cvId);

        if (aiExtracted.isEmpty()) {
            return CvExtractionResponse.builder()
                    .cvId(cvId)
                    .extractedSkills(Collections.emptyList())
                    .newSkillsCount(0)
                    .matchedSkillsCount(0)
                    .build();
        }

        int matchedCount = 0;
        int newCount = 0;
        List<SkillResponse> extractedSkills = new ArrayList<>();

        for (ExtractedSkillDto extracted : aiExtracted) {
            if (extracted.getName() == null || extracted.getName().isBlank()) {
                continue;
            }

            // 3. Check if skill already exists in Neo4j
            Optional<SkillNode> existing = skillNodeRepository
                    .findByNameIgnoreCase(extracted.getName().trim());

            SkillNode skillNode;
            if (existing.isPresent()) {
                skillNode = existing.get();
                matchedCount++;
            } else {
                // 4. New skill → create with embedding, isVerified=false
                List<Double> embedding = aiServiceClient.generateEmbedding(extracted.getName());

                skillNode = SkillNode.builder()
                        .id(UUID.randomUUID().toString())
                        .name(extracted.getName().trim())
                        .isVerified(false)
                        .embedding(embedding)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build();

                skillNode = skillNodeRepository.save(skillNode);
                newCount++;
                log.info("Created new unverified skill: {} (embedding dim: {})",
                        skillNode.getName(),
                        embedding != null ? embedding.size() : 0);

                // --- AI Auto-Suggestion (Configurable Asymmetric Graph) ---
                if (embedding != null && !embedding.isEmpty()) {
                    List<SkillNode> similarSkills = skillNodeRepository.findSimilarByEmbedding(embedding, 20);
                    
                    for (SkillNode similar : similarSkills) {
                        if (similar.getId().equals(skillNode.getId()) || similar.getEmbedding() == null) continue;

                        double similarity = calculateCosineSimilarity(embedding, similar.getEmbedding());
                        
                        if (similarity >= 0.95) {
                            // Suggest SYNONYM
                            skillNodeRepository.createPendingSynonym(skillNode.getId(), similar.getId());
                            log.info("Suggested PENDING_SYNONYM between {} and {} (score: {})", 
                                    skillNode.getName(), similar.getName(), similarity);
                        } else if (similarity >= 0.85) {
                            // Suggest RELATED_TO
                            skillNodeRepository.createPendingRelatedTo(skillNode.getId(), similar.getId());
                            log.info("Suggested PENDING_RELATED_TO between {} and {} (score: {})", 
                                    skillNode.getName(), similar.getName(), similarity);
                        }
                    }
                }
            }

            // 5. Create CvSkill bridge record in PostgreSQL
            CvSkill cvSkill = CvSkill.builder()
                    .cv(cv)
                    .skillNeo4jId(skillNode.getId())
                    .proficiencyLevel(mapLevel(extracted.getLevel()))
                    .isAiExtracted(true)
                    .build();
            cvSkillRepository.save(cvSkill);

            extractedSkills.add(skillMapper.toResponse(skillNode));
        }

        log.info("CV {} extraction complete: {} matched, {} new", cvId, matchedCount, newCount);

        return CvExtractionResponse.builder()
                .cvId(cvId)
                .extractedSkills(extractedSkills)
                .newSkillsCount(newCount)
                .matchedSkillsCount(matchedCount)
                .build();
    }

    private double calculateCosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1.size() != v2.size()) return 0.0;
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        for (int i = 0; i < v1.size(); i++) {
            dotProduct += v1.get(i) * v2.get(i);
            norm1 += Math.pow(v1.get(i), 2);
            norm2 += Math.pow(v2.get(i), 2);
        }
        if (norm1 == 0 || norm2 == 0) return 0.0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Map AI-extracted level string to SkillLevel enum.
     */
    private SkillLevel mapLevel(String level) {
        if (level == null || level.isBlank()) {
            return SkillLevel.BEGINNER;
        }
        try {
            return SkillLevel.valueOf(level.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown skill level '{}', defaulting to BEGINNER", level);
            return SkillLevel.BEGINNER;
        }
    }
}
