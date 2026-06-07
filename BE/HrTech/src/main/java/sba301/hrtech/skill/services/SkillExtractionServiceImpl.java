package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.abstractions.repositories.CvSkillRepository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.repositories.JobSkillRepository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.shared.common.ErrorCode;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.shared.enums.SkillLevel;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;
import sba301.hrtech.skill.dtos.response.CvExtractionResponse;
import sba301.hrtech.skill.dtos.response.ExtractedJobSkillDto;
import sba301.hrtech.skill.dtos.response.ExtractedSkillDto;
import sba301.hrtech.skill.dtos.response.ParseExtractResponseDto;
import sba301.hrtech.skill.dtos.response.SkillProcessResult;
import sba301.hrtech.skill.dtos.response.SkillResponse;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.skill.mapper.SkillMapper;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillExtractionServiceImpl implements ISkillExtractionService {

    private final CvRepository cvRepository;
    private final CvSkillRepository cvSkillRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final SkillNodeRepository skillNodeRepository;
    private final AiServiceClient aiServiceClient;
    private final SkillMapper skillMapper;

    @Override
    @Async
    @Transactional
    public CompletableFuture<CvExtractionResponse> extractAndSaveSkills(UUID cvId) {
        // 1. Get CV from PostgreSQL
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.CV_NOT_FOUND, "CV not found: " + cvId));

        cv.setExtractionStatus(ExtractionStatus.PROCESSING);
        cvRepository.save(cv);

        try {
            String fileUrl = cv.getFileUrl();
            if (fileUrl == null || fileUrl.isBlank()) {
                cv.setExtractionStatus(ExtractionStatus.COMPLETED);
                cvRepository.save(cv);
                return CompletableFuture.completedFuture(CvExtractionResponse.builder()
                        .cvId(cvId)
                        .extractedSkills(Collections.emptyList())
                        .newSkillsCount(0)
                        .matchedSkillsCount(0)
                        .build());
            }

            // 2. Call Python AI to parse PDF and extract skills in one go
            ParseExtractResponseDto parseResult = aiServiceClient.parseAndExtractCv(fileUrl);

            if (parseResult == null) {
                cv.setExtractionStatus(ExtractionStatus.COMPLETED);
                cvRepository.save(cv);
                return CompletableFuture.completedFuture(CvExtractionResponse.builder()
                        .cvId(cvId)
                        .extractedSkills(Collections.emptyList())
                        .newSkillsCount(0)
                        .matchedSkillsCount(0)
                        .build());
            }

            // Update CV with raw parsed text
            cv.setParsedContent(parseResult.getParsedContent());

            List<ExtractedSkillDto> aiExtracted = parseResult.getSkills();
            log.info("AI Service parsed and extracted {} skills from CV {}",
                    aiExtracted != null ? aiExtracted.size() : 0, cvId);

            if (aiExtracted == null || aiExtracted.isEmpty()) {
                cv.setExtractionStatus(ExtractionStatus.COMPLETED);
                cvRepository.save(cv);
                return CompletableFuture.completedFuture(CvExtractionResponse.builder()
                        .cvId(cvId)
                        .extractedSkills(Collections.emptyList())
                        .newSkillsCount(0)
                        .matchedSkillsCount(0)
                        .build());
            }

            int matchedCount = 0;
            int newCount = 0;
            List<SkillResponse> extractedSkills = new ArrayList<>();

            for (ExtractedSkillDto extracted : aiExtracted) {
                if (extracted.getName() == null || extracted.getName().isBlank()) {
                    continue;
                }

                SkillProcessResult result = processAndGetSkillNode(extracted.getName());
                SkillNode skillNode = result.skillNode();

                if (result.isNew()) {
                    newCount++;
                } else {
                    matchedCount++;
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

            cv.setExtractionStatus(ExtractionStatus.COMPLETED);
            cvRepository.save(cv);
            log.info("CV {} extraction complete: {} matched, {} new", cvId, matchedCount, newCount);

            return CompletableFuture.completedFuture(CvExtractionResponse.builder()
                    .cvId(cvId)
                    .extractedSkills(extractedSkills)
                    .newSkillsCount(newCount)
                    .matchedSkillsCount(matchedCount)
                    .build());
        } catch (Exception e) {
            log.error("Failed to extract skills for CV: {}", cvId, e);
            cv.setExtractionStatus(ExtractionStatus.FAILED);
            cvRepository.save(cv);
            throw e;
        }
    }

    @Override
    @Async
    @Transactional
    public void extractAndSaveJobSkills(UUID jobId) {
        // 1. Get Job from PostgreSQL
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));

        String description = job.getDescription();
        String requirements = job.getRequirements();

        if ((description == null || description.isBlank()) && (requirements == null || requirements.isBlank())) {
            job.setExtractionStatus(ExtractionStatus.COMPLETED);
            jobRepository.save(job);
            return;
        }

        try {
            // 2. Call Gemini AI to extract skills
            List<ExtractedJobSkillDto> aiExtracted = aiServiceClient.extractJobSkillsFromText(description,
                    requirements);
            log.info("Gemini extracted {} skills from Job {}", aiExtracted.size(), jobId);

            // Get existing job skill Neo4j IDs to prevent duplicates
            Set<String> existingSkillNeo4jIds = new HashSet<>();
            for (JobSkill js : job.getJobSkills()) {
                existingSkillNeo4jIds.add(js.getSkillNeo4jId());
            }

            for (ExtractedJobSkillDto extracted : aiExtracted) {
                if (extracted.getName() == null || extracted.getName().isBlank()) {
                    continue;
                }

                SkillProcessResult result = processAndGetSkillNode(extracted.getName());
                SkillNode skillNode = result.skillNode();

                // If already manually added by employer, skip to avoid duplicates
                if (!existingSkillNeo4jIds.contains(skillNode.getId())) {
                    // 5. Create JobSkill bridge record in PostgreSQL
                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skillNeo4jId(skillNode.getId())
                            .requiredLevel(mapLevel(extracted.getLevel()))
                            .isMandatory(extracted.getIsMandatory() != null ? extracted.getIsMandatory() : false)
                            .build();
                    jobSkillRepository.save(jobSkill);
                    existingSkillNeo4jIds.add(skillNode.getId()); // Prevent duplicates in the same extraction loop
                }
            }

            job.setExtractionStatus(ExtractionStatus.COMPLETED);
            jobRepository.save(job);
            log.info("Job {} extraction complete", jobId);
        } catch (Exception e) {
            log.error("Job extraction failed for job {}", jobId, e);
            job.setExtractionStatus(ExtractionStatus.FAILED);
            jobRepository.save(job);
        }
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
     * Reusable method to find or create a SkillNode with its embeddings and relationships.
     */
    private SkillProcessResult processAndGetSkillNode(String skillName) {
        String name = skillName.trim();
        Optional<SkillNode> existing = skillNodeRepository.findByNameIgnoreCase(name);

        if (existing.isPresent()) {
            return new SkillProcessResult(existing.get(), false);
        }

        // Create new skill -> generate embedding, isVerified=false
        List<Double> embedding = aiServiceClient.generateEmbedding(name);

        SkillNode skillNode = SkillNode.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .isVerified(false)
                .embedding(embedding)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        skillNode = skillNodeRepository.save(skillNode);
        log.info("Created new unverified skill: {} (embedding dim: {})",
                skillNode.getName(),
                embedding != null ? embedding.size() : 0);

        // --- AI Auto-Suggestion (Configurable Asymmetric Graph) ---
        if (embedding != null && !embedding.isEmpty()) {
            List<SkillNode> similarSkills = skillNodeRepository.findSimilarByEmbedding(embedding, 20);

            for (SkillNode similar : similarSkills) {
                if (similar.getId().equals(skillNode.getId()) || similar.getEmbedding() == null)
                    continue;

                double similarity = calculateCosineSimilarity(embedding, similar.getEmbedding());

                if (similarity >= 0.95) {
                    // Suggest SYNONYM
                    skillNodeRepository.createPendingSynonym(skillNode.getId(), similar.getId());
                } else if (similarity >= 0.85) {
                    // Suggest RELATED_TO
                    skillNodeRepository.createPendingRelatedTo(skillNode.getId(), similar.getId());
                }
            }
        }

        return new SkillProcessResult(skillNode, true);
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
