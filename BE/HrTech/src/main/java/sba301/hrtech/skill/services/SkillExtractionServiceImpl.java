package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.cv.abstractions.services.ICvService;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.shared.enums.SkillLevel;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.abstractions.repositories.RoleAliasRepository;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;
import sba301.hrtech.skill.dtos.response.*;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.skill.mapper.SkillMapper;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillExtractionServiceImpl implements ISkillExtractionService {

    private final ICvService cvService;
    private final IJobService jobService;
    private final SkillNodeRepository skillNodeRepository;
    private final RoleAliasRepository roleAliasRepository;
    private final AiServiceClient aiServiceClient;
    private final SkillMapper skillMapper;

    @Override
    @Async
    @Transactional
    public CompletableFuture<CvExtractionResponse> extractAndSaveSkills(UUID cvId) {
        // 1. Get CV from PostgreSQL
        Cv cv = cvService.getCvEntityById(cvId);

        cv.setExtractionStatus(ExtractionStatus.PROCESSING);
        cvService.saveCvEntity(cv);

        try {
            String fileUrl = cv.getFileUrl();
            if (fileUrl == null || fileUrl.isBlank()) {
                cv.setExtractionStatus(ExtractionStatus.COMPLETED);
                cvService.saveCvEntity(cv);
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
                cvService.saveCvEntity(cv);
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
                cvService.saveCvEntity(cv);
                return CompletableFuture.completedFuture(CvExtractionResponse.builder()
                        .cvId(cvId)
                        .extractedSkills(Collections.emptyList())
                        .newSkillsCount(0)
                        .matchedSkillsCount(0)
                        .build());
            }

            aiExtracted = filterAndValidateSkills(aiExtracted);

            int matchedCount = 0;
            int newCount = 0;
            List<SkillResponse> extractedSkills = new ArrayList<>();
            List<String> newlyCreatedSkills = new ArrayList<>();
            Set<String> existingSkillNeo4jIds = new HashSet<>();

            for (ExtractedSkillDto extracted : aiExtracted) {
                if (extracted.getName() == null || extracted.getName().isBlank()) {
                    continue;
                }
                // Filter out garbage names: single chars, special chars only, numbers-only
                if (!isValidSkillName(extracted.getName())) {
                    log.debug("Skipping invalid skill name: '{}'", extracted.getName());
                    continue;
                }

                SkillProcessResult result = processAndGetSkillNode(extracted.getName());
                SkillNode skillNode = result.skillNode();

                if (result.isNew() || skillNode.getRoles() == null || skillNode.getRoles().isEmpty()) {
                    if (result.isNew()) {
                        newCount++;
                    }
                    newlyCreatedSkills.add(skillNode.getName());
                } else {
                    matchedCount++;
                }

                if (!existingSkillNeo4jIds.contains(skillNode.getId())) {
                    // 5. Create CvSkill bridge record in PostgreSQL
                    CvSkill cvSkill = CvSkill.builder()
                            .cv(cv)
                            .skillNeo4jId(skillNode.getId())
                            .proficiencyLevel(mapLevel(extracted.getLevel()))
                            .isAiExtracted(true)
                            .build();
                    cvService.saveCvSkill(cvSkill);
                    existingSkillNeo4jIds.add(skillNode.getId());
                }

                extractedSkills.add(skillMapper.toResponse(skillNode));
            }

            cv.setExtractionStatus(ExtractionStatus.COMPLETED);
            cvService.saveCvEntity(cv);
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
            cvService.saveCvEntity(cv);
            throw e;
        }
    }

    @Override
    @Async
    @Transactional
    public CompletableFuture<JobExtractionResponse> extractAndSaveJobSkills(UUID jobId) {
        // 1. Get Job from PostgreSQL
        Job job = jobService.getJobEntityById(jobId);

        String description = job.getDescription();
        String requirements = job.getRequirements();

        if ((description == null || description.isBlank()) && (requirements == null || requirements.isBlank())) {
            job.setExtractionStatus(ExtractionStatus.COMPLETED);
            jobService.saveJobEntity(job);
            return CompletableFuture.completedFuture(JobExtractionResponse.builder()
                    .jobId(jobId)
                    .extractedSkills(Collections.emptyList())
                    .newSkillsCount(0)
                    .matchedSkillsCount(0)
                    .build());
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
            JobExtractResponseDto extractResult = aiServiceClient.extractJobSkillsFromText(description,
                    requirements);

            if (extractResult == null) {
                job.setExtractionStatus(ExtractionStatus.COMPLETED);
                jobService.saveJobEntity(job);
                return CompletableFuture.completedFuture(JobExtractionResponse.builder()
                        .jobId(jobId)
                        .extractedSkills(Collections.emptyList())
                        .newSkillsCount(0)
                        .matchedSkillsCount(0)
                        .build());
            }

            List<ExtractedSkillDto> aiExtracted = extractResult.getSkills();
            log.info("Gemini extracted {} skills from Job {}", aiExtracted != null ? aiExtracted.size() : 0, jobId);

            if (aiExtracted == null || aiExtracted.isEmpty()) {
                job.setExtractionStatus(ExtractionStatus.COMPLETED);
                jobService.saveJobEntity(job);
                return CompletableFuture.completedFuture(JobExtractionResponse.builder()
                        .jobId(jobId)
                        .extractedSkills(Collections.emptyList())
                        .newSkillsCount(0)
                        .matchedSkillsCount(0)
                        .build());
            }

            aiExtracted = filterAndValidateSkills(aiExtracted);

            Set<String> existingSkillNeo4jIds = new HashSet<>();
            for (JobSkill js : job.getJobSkills()) {
                existingSkillNeo4jIds.add(js.getSkillNeo4jId());
            }

            int matchedCount = 0;
            int newCount = 0;
            List<SkillResponse> extractedSkills = new ArrayList<>();
            List<String> newlyCreatedSkills = new ArrayList<>();

            for (ExtractedSkillDto extracted : aiExtracted) {
                if (extracted.getName() == null || extracted.getName().isBlank()) {
                    continue;
                }
                // Filter out garbage names: single chars, special chars only, numbers-only
                if (!isValidSkillName(extracted.getName())) {
                    log.debug("Skipping invalid skill name: '{}'", extracted.getName());
                    continue;
                }

                SkillProcessResult result = processAndGetSkillNode(extracted.getName());
                SkillNode skillNode = result.skillNode();
                
                if (result.isNew() || skillNode.getRoles() == null || skillNode.getRoles().isEmpty()) {
                    if (result.isNew()) {
                        newCount++;
                    }
                    newlyCreatedSkills.add(skillNode.getName());
                } else {
                    matchedCount++;
                }

                // If already manually added by employer, skip to avoid duplicates
                if (!existingSkillNeo4jIds.contains(skillNode.getId())) {
                    // 5. Create JobSkill bridge record in PostgreSQL
                    JobSkill jobSkill = JobSkill.builder()
                            .job(job)
                            .skillNeo4jId(skillNode.getId())
                            .requiredLevel(mapLevel(extracted.getLevel()))
                            .isAiExtracted(true)
                            .build();
                    jobService.saveJobSkill(jobSkill);
                    existingSkillNeo4jIds.add(skillNode.getId()); // Prevent duplicates in the same extraction loop
                }

                extractedSkills.add(skillMapper.toResponse(skillNode));
            }

            job.setExtractionStatus(ExtractionStatus.COMPLETED);
            jobService.saveJobEntity(job);
            log.info("Job {} extraction complete", jobId);

            if (!newlyCreatedSkills.isEmpty()) {
                CompletableFuture.runAsync(() -> mapRelationshipsForNewSkills(newlyCreatedSkills));
            }

            return CompletableFuture.completedFuture(JobExtractionResponse.builder()
                    .jobId(jobId)
                    .extractedSkills(extractedSkills)
                    .newSkillsCount(newCount)
                    .matchedSkillsCount(matchedCount)
                    .build());
        } catch (Exception e) {
            log.error("Job extraction failed for job {}", jobId, e);
            job.setExtractionStatus(ExtractionStatus.FAILED);
            jobService.saveJobEntity(job);
            throw e;
        }
    }

    private void mapRelationshipsForNewSkills(List<String> newSkills) {
        try {
            log.info("Triggering background relationship mapping for {} new skills", newSkills.size());
            List<String> allDbSkills = skillNodeRepository.findAllNames();
            List<String> canonicalRoles = roleAliasRepository.findDistinctCanonicalRoles();
            
            MapRelationshipsResponseDto response = aiServiceClient.mapRelationships(newSkills, allDbSkills, canonicalRoles);
            if (response != null && response.getRelationships() != null) {
                for (SkillRelationshipDto rel : response.getRelationships()) {
                    String newSkill = rel.getNewSkill();
                    
                    // === STEP 1: Always save roles, regardless of whether there are relationships ===
                    Optional<SkillNode> nodeOpt = skillNodeRepository.findByNameIgnoreCase(newSkill);
                    if (nodeOpt.isPresent()) {
                        SkillNode node = nodeOpt.get();
                        List<String> suggestedRoles = rel.getSuggestedRoles();
                        // Only update if AI returned valid roles; never overwrite with empty
                        if (suggestedRoles != null && !suggestedRoles.isEmpty()) {
                            // Normalize to lowercase to ensure consistent matching in Neo4j
                            List<String> normalizedRoles = suggestedRoles.stream()
                                    .map(r -> r.trim().toLowerCase())
                                    .distinct()
                                    .toList();
                            node.setRoles(normalizedRoles);
                            skillNodeRepository.save(node);
                            log.info("Saved roles {} to skill '{}'", normalizedRoles, newSkill);
                        } else {
                            log.warn("AI returned empty roles for skill '{}', skipping role update", newSkill);
                        }
                    }

                    // === STEP 2: Create direct (1-hop) relationships, with duplicate guard ===
                    if (rel.getRelations() != null) {
                        for (SkillRelationDetail detail : rel.getRelations()) {
                            String type = detail.getType();
                            if (type == null) continue;

                            if ("PARENT_OF".equals(type)) {
                                String parentName = (detail.getParent() != null && !detail.getParent().isBlank()) ? detail.getParent() : newSkill;
                                String childName = (detail.getChild() != null && !detail.getChild().isBlank()) ? detail.getChild() : detail.getTarget();

                                if (parentName == null || childName == null || parentName.equalsIgnoreCase(childName)) continue;

                                Boolean alreadyLinked = skillNodeRepository.anyRelationshipExistsByName(parentName, childName);
                                if (Boolean.TRUE.equals(alreadyLinked)) {
                                    log.debug("Relationship between '{}' and '{}' already exists, skipping", parentName, childName);
                                    continue;
                                }
                                skillNodeRepository.createPendingParentOfByName(parentName, childName);
                            } else if ("RELATED_TO".equals(type)) {
                                String target = detail.getTarget();
                                if (target == null || target.equalsIgnoreCase(newSkill)) continue;
                                Boolean alreadyLinked = skillNodeRepository.anyRelationshipExistsByName(newSkill, target);
                                if (!Boolean.TRUE.equals(alreadyLinked)) {
                                    skillNodeRepository.createPendingRelatedToByName(newSkill, target);
                                }
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

    /**
     * Filters a list of extracted skills, checks Neo4j for existence, and calls AI 
     * to validate any newly discovered skills to ensure they are real IT skills.
     */
    private List<ExtractedSkillDto> filterAndValidateSkills(List<ExtractedSkillDto> rawSkills) {
        List<ExtractedSkillDto> validCandidates = new ArrayList<>();
        List<String> toValidate = new ArrayList<>();
        Map<String, ExtractedSkillDto> nameToDtoMap = new HashMap<>();

        for (ExtractedSkillDto extracted : rawSkills) {
            String name = extracted.getName();
            if (name == null || name.isBlank() || !isValidSkillName(name)) {
                continue;
            }
            name = name.trim();
            nameToDtoMap.put(name, extracted);

            Optional<SkillNode> existing = skillNodeRepository.findByNameIgnoreCase(name);
            if (existing.isPresent()) {
                validCandidates.add(extracted);
            } else {
                toValidate.add(name);
            }
        }

        if (!toValidate.isEmpty()) {
            try {
                ValidateSkillsResponse aiResponse = aiServiceClient.validateSkills(toValidate);
                    
                if (aiResponse != null && aiResponse.getValidSkills() != null) {
                    for (String validName : aiResponse.getValidSkills()) {
                        ExtractedSkillDto dto = nameToDtoMap.get(validName);
                        if (dto != null) {
                            validCandidates.add(dto);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to validate new skills with AI: {}", e.getMessage(), e);
                // Strict approach: if AI fails, we drop the new skills.
            }
        }
        return validCandidates;
    }

    /**
     * Guards against garbage skill names extracted by AI.
     * Rules:
     *  - Must be at least 2 characters long (e.g. rejects "r", "c", "j", "-", "•")
     *  - Must contain at least one letter (rejects purely numeric or punctuation)
     *
     * Note: Short but valid skills like "Go", "C#", "C++" pass because they contain letters
     * and are >= 2 chars. Single-char extractions like "r" (R language) are unfortunately
     * ambiguous and filtered out to avoid graph pollution.
     */
    private boolean isValidSkillName(String name) {
        String trimmed = name.trim();
        if (trimmed.length() < 2) return false;
        // Must contain at least one letter
        return trimmed.chars().anyMatch(Character::isLetter);
    }
}
