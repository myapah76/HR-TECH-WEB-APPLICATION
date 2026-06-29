package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sba301.hrtech.cv.abstractions.services.ICvService;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.shared.enums.ScoreGrade;
import sba301.hrtech.shared.enums.SkillLevel;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.abstractions.services.IRecommendationService;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;
import sba301.hrtech.skill.dtos.response.*;
import sba301.hrtech.skill.entities.SkillNode;
import sba301.hrtech.application.abstractions.services.IAiMatchHistoryService;
import sba301.hrtech.application.entities.AiMatchHistory;
import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.subscription.abstractions.services.ICreditService;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements IRecommendationService {

    private final ICvService cvService;
    private final IJobService jobService;
    private final SkillNodeRepository skillNodeRepository;
    private final ISkillExtractionService skillExtractionService;
    private final AiServiceClient aiServiceClient;
    private final IAiMatchHistoryService aiMatchHistoryService;
    private final ICreditService creditService;
    private final AuthUtils authUtils;


    // === Skill level numeric values ===
    private static final Map<SkillLevel, Integer> LEVEL_VALUES = Map.of(
            SkillLevel.BEGINNER, 1,
            SkillLevel.INTERMEDIATE, 2,
            SkillLevel.ADVANCED, 3,
            SkillLevel.EXPERT, 4);

    // === Graph match multipliers ===
    private static final double EXACT_MATCH = 1.0;
    private static final double RELATED_MATCH = 0.7;
    private static final double PARENT_TO_CHILD_MATCH = 0.4;
    private static final double CHILD_TO_PARENT_MATCH = 0.8;

    @Override
    @Transactional(readOnly = true)
    public RecommendationResultResponse analyzeCvAndRecommend(UUID cvId, int limit) {
        // 1. Extract skills from CV
        CvExtractionResponse extraction = skillExtractionService.extractAndSaveSkills(cvId).join();

        // 2. Recommend jobs
        List<JobRecommendationResponse> recommendations = recommendJobsForCv(cvId, limit);

        return RecommendationResultResponse.builder()
                .cvId(cvId)
                .extraction(extraction)
                .recommendedJobs(recommendations)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobRecommendationResponse> recommendJobsForCv(UUID cvId, int limit) {
        Cv cv = cvService.getCvEntityById(cvId);
        UUID userId = cv.getUser().getId();
        
        // Check Feature Access & Deduct Token
        if (!creditService.hasCandidateFeatureAccess(userId, "RECOMMEND_JOB")) {
            throw new AppException(ErrorCode.FORBIDDEN, "Gói của bạn không có tính năng Gợi ý Job (RECOMMEND_JOB). Vui lòng nâng cấp gói.");
        }
        creditService.deductCandidateQuota(userId, "AI_CREDIT", 50);

        CvSkillContext ctx = buildCvSkillContext(cv);
        List<Job> allJobs = jobService.getAllJobEntities();
        List<JobRecommendationResponse> recommendations = new ArrayList<>();

        for (Job job : allJobs) {
            List<JobSkill> jobSkills = job.getJobSkills();
            if (jobSkills == null || jobSkills.isEmpty()) {
                continue;
            }

            CompanyWeights weights = extractCompanyWeights(job);

            double matchScore = calculateGraphScore(ctx.cvSkillMap(), ctx.expandedCvSkillTypes(), jobSkills, weights);

            List<String> matchedSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();
            categorizeSkills(ctx.cvSkillMap().keySet(), ctx.expandedCvSkillTypes(), jobSkills, matchedSkills,
                    missingSkills);

            recommendations.add(JobRecommendationResponse.builder()
                    .jobId(job.getId())
                    .jobTitle(job.getTitle())
                    .companyName(job.getCompany() != null ? job.getCompany().getName() : null)
                    .location(job.getLocation())
                    .salaryMin(job.getSalaryMin())
                    .salaryMax(job.getSalaryMax())
                    .matchScore(Math.round(matchScore * 100.0) / 100.0)
                    .matchGrade(getGrade(matchScore))
                    .matchedSkills(matchedSkills)
                    .missingSkills(missingSkills)
                    .build());
        }

        return recommendations.stream()
                .sorted(Comparator.comparingDouble(JobRecommendationResponse::getMatchScore).reversed())
                .limit(limit)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SkillMatchScoreResponse calculateMatchScore(UUID cvId, UUID jobId) {
        Cv cv = cvService.getCvEntityById(cvId);

        Job job = jobService.getJobEntityById(jobId);

        CvSkillContext ctx = buildCvSkillContext(cv);
        List<JobSkill> jobSkills = job.getJobSkills();
        CompanyWeights weights = extractCompanyWeights(job);

        double matchScore = calculateGraphScore(ctx.cvSkillMap(), ctx.expandedCvSkillTypes(), jobSkills, weights);

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        categorizeSkills(ctx.cvSkillMap().keySet(), ctx.expandedCvSkillTypes(), jobSkills, matchedSkills,
                missingSkills);
        List<SkillMatchDetail> details = buildSkillMatchDetails(ctx.cvSkillMap(), ctx.expandedCvSkillTypes(),
                jobSkills);

        return SkillMatchScoreResponse.builder()
                .overallScore(Math.round(matchScore * 100.0) / 100.0)
                .grade(getGrade(matchScore))
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .skillDetails(details)
                .build();
    }

    @Override
    public AiMatchHistoryResponse performPremiumAiMatching(UUID cvId, UUID jobId) {
        UUID userId = authUtils.getCurrentUserId();
        // Check Feature Access
        if (!creditService.hasCandidateFeatureAccess(userId, "AI_MATCHING")) {
            throw new AppException(ErrorCode.FORBIDDEN, "Gói của bạn không có tính năng AI Matching. Vui lòng nâng cấp.");
        }

        // 1. Check if history exists
        Optional<AiMatchHistory> existingHistory = aiMatchHistoryService.getHistoryEntityByCvAndJob(cvId, jobId);

        // Calculate score
        SkillMatchScoreResponse matchScore = calculateMatchScore(cvId, jobId);
        
        Cv cv = cvService.getCvEntityById(cvId);
        Job job = jobService.getJobEntityById(jobId);

        String improvementTips = "";
        List<String> actionPlan = new ArrayList<>();
        AiMatchHistory history;

        if (existingHistory.isPresent()) {
            history = existingHistory.get();
            improvementTips = history.getImprovementTips();
            
            if (history.getActionPlan() != null && !history.getActionPlan().isEmpty()) {
                actionPlan = Arrays.asList(history.getActionPlan().split("\n\\|\\|\\|\n"));
            }
        } else {
            // Check & Deduct AI_CREDIT (20 tokens)
            creditService.deductCandidateQuota(userId, "AI_CREDIT", 20);
            
            // Call AI Service
            AiMatchingAdviceResponseDto advice =
                aiServiceClient.getMatchingAdvice(cv.getParsedContent(), job.getDescription() + "\n" + job.getRequirements(), matchScore.getMissingSkills());
            
            if (advice != null) {
                improvementTips = advice.getImprovement_tips();
                actionPlan = advice.getAction_plan();
            }

            // Save history
            String actionPlanStr = actionPlan != null ? String.join("\n|||\n", actionPlan) : "";
            history = AiMatchHistory.builder()
                .userId(userId)
                .cvId(cvId)
                .jobId(jobId)
                .overallScore(BigDecimal.valueOf(matchScore.getOverallScore()))
                .improvementTips(improvementTips)
                .actionPlan(actionPlanStr)
                .build();
            history = aiMatchHistoryService.saveHistoryEntity(history);
        }

        return AiMatchHistoryResponse.builder()
            .id(history.getId() != null ? history.getId().toString() : null)
            .overallScore(matchScore.getOverallScore())
            .matchGrade(matchScore.getGrade())
            .matchedSkills(matchScore.getMatchedSkills())
            .missingSkills(matchScore.getMissingSkills())
            .skillDetails(matchScore.getSkillDetails())
            .improvementTips(improvementTips)
            .actionPlan(actionPlan)
            .build();
    }

    // ========== PRIVATE HELPER METHODS & RECORDS ==========

    private record CompanyWeights(
            double relatedWeight,
            double childToParentWeight,
            double parentToChildWeight) {
    }

    private record CvSkillContext(
            Map<String, CvSkill> cvSkillMap,
            Map<String, Set<String>> expandedCvSkillTypes) {
    }

    private CvSkillContext buildCvSkillContext(Cv cv) {
        List<CvSkill> cvSkills = cv.getCvSkills();
        if (cvSkills == null || cvSkills.isEmpty()) {
            return new CvSkillContext(Collections.emptyMap(), Collections.emptyMap());
        }

        Map<String, CvSkill> cvSkillMap = cvSkills.stream()
                .collect(Collectors.toMap(CvSkill::getSkillNeo4jId, s -> s, (a, b) -> a));

        Set<String> cvSkillIds = cvSkillMap.keySet();
        Map<String, Set<String>> expandedCvSkillTypes = expandSkillsThroughGraph(cvSkillIds);

        return new CvSkillContext(cvSkillMap, expandedCvSkillTypes);
    }

    private CompanyWeights extractCompanyWeights(Job job) {
        double jobRelatedWeight = RELATED_MATCH;
        double jobChildToParentWeight = CHILD_TO_PARENT_MATCH;
        double jobParentToChildWeight = PARENT_TO_CHILD_MATCH;

        if (job.getCompany() != null) {
            if (job.getCompany().getRelatedWeight() != null)
                jobRelatedWeight = job.getCompany().getRelatedWeight();
            if (job.getCompany().getChildToParentWeight() != null)
                jobChildToParentWeight = job.getCompany().getChildToParentWeight();
            if (job.getCompany().getParentToChildWeight() != null)
                jobParentToChildWeight = job.getCompany().getParentToChildWeight();
        }

        return new CompanyWeights(jobRelatedWeight,
                jobChildToParentWeight, jobParentToChildWeight);
    }

    /**
     * Expand skill IDs through graph relationships and return their relationship
     * types.
     * Types: SYNONYM, RELATED, CHILD_TO_PARENT, PARENT_TO_CHILD
     */
    private Map<String, Set<String>> expandSkillsThroughGraph(Set<String> originalSkillIds) {
        Map<String, Set<String>> expanded = new HashMap<>();

        for (String skillId : originalSkillIds) {
            // Related
            try {
                List<SkillNode> related = skillNodeRepository.findRelatedSkills(skillId);
                for (SkillNode r : related) {
                    expanded.computeIfAbsent(r.getId(), k -> new HashSet<>()).add("RELATED");
                }
            } catch (Exception e) {
                log.warn("Could not expand related for skill {}: {}", skillId, e.getMessage());
            }

            // Child to Parent (CV has child, Job needs parent -> find parents)
            try {
                List<SkillNode> parents = skillNodeRepository.findParents(skillId);
                for (SkillNode p : parents) {
                    expanded.computeIfAbsent(p.getId(), k -> new HashSet<>()).add("CHILD_TO_PARENT");
                }
            } catch (Exception e) {
                log.warn("Could not expand parents for skill {}: {}", skillId, e.getMessage());
            }

            // Parent to Child (CV has parent, Job needs child -> find children)
            try {
                List<SkillNode> children = skillNodeRepository.findChildren(skillId);
                for (SkillNode c : children) {
                    expanded.computeIfAbsent(c.getId(), k -> new HashSet<>()).add("PARENT_TO_CHILD");
                }
            } catch (Exception e) {
                log.warn("Could not expand children for skill {}: {}", skillId, e.getMessage());
            }
        }

        return expanded;
    }



    /**
     * Calculate graph-based matching score.
     * Score = Σ(matchWeight × levelScore) / Σ(totalWeight)
     */
    private double calculateGraphScore(Map<String, CvSkill> cvSkillMap,
            Map<String, Set<String>> expandedCvSkillTypes,
            List<JobSkill> jobSkills,
            CompanyWeights weights) {
        double totalWeight = 0.0;
        double matchedWeight = 0.0;

        for (JobSkill jobSkill : jobSkills) {
            double weight = Boolean.FALSE.equals(jobSkill.getIsAiExtracted()) ? 1.0 : 0.5;
            totalWeight += weight;

            String jobSkillNeo4jId = jobSkill.getSkillNeo4jId();

            if (cvSkillMap.containsKey(jobSkillNeo4jId)) {
                // EXACT match
                CvSkill cvSkill = cvSkillMap.get(jobSkillNeo4jId);
                double levelScore = calculateLevelScore(cvSkill.getProficiencyLevel(), jobSkill.getRequiredLevel());
                matchedWeight += weight * EXACT_MATCH * levelScore;
            } else if (expandedCvSkillTypes.containsKey(jobSkillNeo4jId)) {
                // RELATED/SYNONYM/PARENT match (from graph expansion)
                double maxMultiplier = 0.0;
                for (String type : expandedCvSkillTypes.get(jobSkillNeo4jId)) {
                    double multiplier = getWeightForType(type, weights);
                    maxMultiplier = Math.max(maxMultiplier, multiplier);
                }
                matchedWeight += weight * maxMultiplier;
            }
            // else: MISSING → contributes 0
        }

        return totalWeight > 0 ? matchedWeight / totalWeight : 0.0;
    }

    private double getWeightForType(String type, CompanyWeights weights) {
        return switch (type) {
            case "RELATED" -> weights.relatedWeight();
            case "CHILD_TO_PARENT" -> weights.childToParentWeight();
            case "PARENT_TO_CHILD" -> weights.parentToChildWeight();
            default -> 0.0;
        };
    }



    /**
     * Calculate level score: min(candidateLevel / requiredLevel, 1.0)
     */
    private double calculateLevelScore(SkillLevel candidateLevel, SkillLevel requiredLevel) {
        if (candidateLevel == null || requiredLevel == null)
            return 0.5;

        int candidate = LEVEL_VALUES.getOrDefault(candidateLevel, 1);
        int required = LEVEL_VALUES.getOrDefault(requiredLevel, 1);

        return Math.min((double) candidate / required, 1.0);
    }

    /**
     * Categorize job skills into matched and missing lists.
     */
    private void categorizeSkills(Set<String> cvSkillIds, Map<String, Set<String>> expandedCvSkillTypes,
            List<JobSkill> jobSkills,
            List<String> matchedSkills, List<String> missingSkills) {
        for (JobSkill jobSkill : jobSkills) {
            String neo4jId = jobSkill.getSkillNeo4jId();
            Optional<SkillNode> skillNode = skillNodeRepository.findById(neo4jId);
            String skillName = skillNode.map(SkillNode::getName).orElse(neo4jId);

            if (cvSkillIds.contains(neo4jId) || expandedCvSkillTypes.containsKey(neo4jId)) {
                matchedSkills.add(skillName);
            } else {
                missingSkills.add(skillName);
            }
        }
    }

    /**
     * Build detailed skill match information for each job skill.
     */
    private List<SkillMatchDetail> buildSkillMatchDetails(Map<String, CvSkill> cvSkillMap,
            Map<String, Set<String>> expandedCvSkillTypes,
            List<JobSkill> jobSkills) {
        List<SkillMatchDetail> details = new ArrayList<>();

        for (JobSkill jobSkill : jobSkills) {
            String neo4jId = jobSkill.getSkillNeo4jId();
            Optional<SkillNode> skillNode = skillNodeRepository.findById(neo4jId);
            String skillName = skillNode.map(SkillNode::getName).orElse(neo4jId);

            String matchType;
            String matchStatus;
            String candidateLevel = null;

            if (cvSkillMap.containsKey(neo4jId)) {
                matchType = "EXACT";
                CvSkill cvSkill = cvSkillMap.get(neo4jId);
                candidateLevel = cvSkill.getProficiencyLevel() != null
                        ? cvSkill.getProficiencyLevel().name()
                        : null;

                int candVal = LEVEL_VALUES.getOrDefault(cvSkill.getProficiencyLevel(), 1);
                int reqVal = LEVEL_VALUES.getOrDefault(jobSkill.getRequiredLevel(), 1);

                if (candVal >= reqVal) {
                    matchStatus = candVal > reqVal ? "EXCEEDED" : "MATCHED";
                } else {
                    matchStatus = "PARTIAL";
                }
            } else if (expandedCvSkillTypes.containsKey(neo4jId)) {
                matchType = String.join(", ", expandedCvSkillTypes.get(neo4jId));
                matchStatus = "MATCHED";
            } else {
                matchType = "NONE";
                matchStatus = "MISSING";
            }

            details.add(SkillMatchDetail.builder()
                    .skillName(skillName)
                    .skillNeo4jId(neo4jId)
                    .matchType(matchType)
                    .requiredLevel(jobSkill.getRequiredLevel() != null
                            ? jobSkill.getRequiredLevel().name()
                            : null)
                    .candidateLevel(candidateLevel)
                    .matchStatus(matchStatus)
                    .build());
        }

        return details;
    }

    /**
     * Determine match grade based on final score.
     */
    private ScoreGrade getGrade(double score) {
        if (score >= 0.80)
            return ScoreGrade.EXCELLENT;
        if (score >= 0.60)
            return ScoreGrade.GOOD;
        if (score >= 0.40)
            return ScoreGrade.FAIR;
        return ScoreGrade.POOR;
    }
}
