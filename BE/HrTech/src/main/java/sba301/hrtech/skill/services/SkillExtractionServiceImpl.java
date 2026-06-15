package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import sba301.hrtech.shared.error.ErrorCode;
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
import sba301.hrtech.skill.dtos.response.MapRelationshipsResponseDto;
import sba301.hrtech.skill.dtos.response.SkillRelationshipDto;
import sba301.hrtech.skill.dtos.response.SkillRelationDetail;
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
                .orElseThrow(() -> new AppException(
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

            // --- RAG Indexing ---
            if (parseResult.getParsedContent() != null && !parseResult.getParsedContent().isBlank()) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("type", "CV");
                metadata.put("cvId", cv.getId().toString());
                if (cv.getUser() != null) {
                    metadata.put("userId", cv.getUser().getId().toString());
                    metadata.put("fullName", (cv.getUser().getFirstName() != null ? cv.getUser().getFirstName() : "") + " " + (cv.getUser().getLastName() != null ? cv.getUser().getLastName() : ""));
                }
                aiServiceClient.indexDocument(cv.getId().toString(), parseResult.getParsedContent(), metadata);
                log.info("Triggered RAG indexing for CV {}", cvId);
            }
            // --------------------

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
            List<String> newlyCreatedSkills = new ArrayList<>();

            for (ExtractedSkillDto extracted : aiExtracted) {
                if (extracted.getName() == null || extracted.getName().isBlank()) {
                    continue;
                }

                SkillProcessResult result = processAndGetSkillNode(extracted.getName());
                SkillNode skillNode = result.skillNode();

                if (result.isNew()) {
                    newCount++;
                    newlyCreatedSkills.add(skillNode.getName());
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

            if (!newlyCreatedSkills.isEmpty()) {
                CompletableFuture.runAsync(() -> mapRelationshipsForNewSkills(newlyCreatedSkills));
            }

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
                .orElseThrow(() -> new AppException(
                        ErrorCode.JOB_NOT_FOUND_CODE, "Job not found: " + jobId));

        String description = job.getDescription();
        String requirements = job.getRequirements();

        if ((description == null || description.isBlank()) && (requirements == null || requirements.isBlank())) {
            job.setExtractionStatus(ExtractionStatus.COMPLETED);
            jobRepository.save(job);
            return;
        }

        try {
            // --- RAG Indexing ---
            StringBuilder fullJobText = new StringBuilder();
            fullJobText.append("Title: ").append(job.getTitle() != null ? job.getTitle() : "").append("\n");
            fullJobText.append("Location: ").append(job.getLocation() != null ? job.getLocation() : "").append("\n");
            fullJobText.append("Salary: ").append(job.getSalaryMin()).append(" - ").append(job.getSalaryMax()).append("\n");
            fullJobText.append("Job Type: ").append(job.getJobType() != null ? job.getJobType().name() : "").append("\n");
            fullJobText.append("Experience Level: ").append(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : "").append("\n\n");
            fullJobText.append("Description:\n").append(description != null ? description : "").append("\n\n");
            fullJobText.append("Requirements:\n").append(requirements != null ? requirements : "").append("\n");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("type", "JOB");
            metadata.put("jobId", job.getId().toString());
            metadata.put("title", job.getTitle());
            metadata.put("location", job.getLocation());
            metadata.put("salaryMin", job.getSalaryMin());
            metadata.put("salaryMax", job.getSalaryMax());
            metadata.put("jobType", job.getJobType() != null ? job.getJobType().name() : null);
            metadata.put("experienceLevel", job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null);

            aiServiceClient.indexDocument(job.getId().toString(), fullJobText.toString(), metadata);
            log.info("Triggered RAG indexing for Job {}", jobId);
            // --------------------

            // 2. Call Gemini AI to extract skills
            List<ExtractedJobSkillDto> aiExtracted = aiServiceClient.extractJobSkillsFromText(description,
                    requirements);
            log.info("Gemini extracted {} skills from Job {}", aiExtracted.size(), jobId);

            Set<String> existingSkillNeo4jIds = new HashSet<>();
            for (JobSkill js : job.getJobSkills()) {
                existingSkillNeo4jIds.add(js.getSkillNeo4jId());
            }

            List<String> newlyCreatedSkills = new ArrayList<>();

            for (ExtractedJobSkillDto extracted : aiExtracted) {
                if (extracted.getName() == null || extracted.getName().isBlank()) {
                    continue;
                }

                SkillProcessResult result = processAndGetSkillNode(extracted.getName());
                SkillNode skillNode = result.skillNode();
                
                if (result.isNew()) {
                    newlyCreatedSkills.add(skillNode.getName());
                }

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

            if (!newlyCreatedSkills.isEmpty()) {
                CompletableFuture.runAsync(() -> mapRelationshipsForNewSkills(newlyCreatedSkills));
            }
        } catch (Exception e) {
            log.error("Job extraction failed for job {}", jobId, e);
            job.setExtractionStatus(ExtractionStatus.FAILED);
            jobRepository.save(job);
        }
    }

    private void mapRelationshipsForNewSkills(List<String> newSkills) {
        try {
            log.info("Triggering background relationship mapping for {} new skills", newSkills.size());
            List<String> allDbSkills = skillNodeRepository.findAllNames();
            
            MapRelationshipsResponseDto response = aiServiceClient.mapRelationships(newSkills, allDbSkills);
            if (response != null && response.getRelationships() != null) {
                for (SkillRelationshipDto rel : response.getRelationships()) {
                    String newSkill = rel.getNewSkill();
                    if (rel.getRelations() != null) {
                        for (SkillRelationDetail detail : rel.getRelations()) {
                            String target = detail.getTarget();
                            String type = detail.getType();
                            if (target == null || type == null) continue;

                            if ("CHILD_TO_PARENT".equals(type)) {
                                skillNodeRepository.createPendingParentOfByName(target, newSkill);
                            } else if ("PARENT_TO_CHILD".equals(type)) {
                                skillNodeRepository.createPendingParentOfByName(newSkill, target);
                            } else if ("RELATED_TO".equals(type)) {
                                skillNodeRepository.createPendingRelatedToByName(newSkill, target);
                            }
                        }
                    }
                }
                log.info("Successfully saved mapped relationships to Neo4j");
            }
        } catch (Exception e) {
            log.error("Error in background relationship mapping: {}", e.getMessage(), e);
        }
    }

    /**
     * Reusable method to find or create a SkillNode without generating embeddings.
     */
    private SkillProcessResult processAndGetSkillNode(String skillName) {
        String name = skillName.trim();
        Optional<SkillNode> existing = skillNodeRepository.findByNameIgnoreCase(name);

        if (existing.isPresent()) {
            return new SkillProcessResult(existing.get(), false);
        }

        SkillNode skillNode = SkillNode.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .isVerified(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        skillNode = skillNodeRepository.save(skillNode);
        log.info("Created new unverified skill: {}", skillNode.getName());

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
