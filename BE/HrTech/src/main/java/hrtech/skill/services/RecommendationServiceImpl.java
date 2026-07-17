package hrtech.skill.services;

import hrtech.skill.dtos.response.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.cv.entities.CvSkill;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobSkill;
import hrtech.shared.enums.ScoreGrade;
import hrtech.shared.enums.SkillLevel;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.skill.abstractions.repositories.SkillNodeRepository;
import hrtech.skill.abstractions.services.IRecommendationService;
import hrtech.skill.abstractions.services.ISkillExtractionService;
import hrtech.skill.entities.SkillNode;
import hrtech.application.abstractions.services.IAiMatchHistoryService;
import hrtech.application.entities.AiMatchHistory;
import hrtech.identity.utils.AuthUtils;
import hrtech.subscription.abstractions.services.ICreditService;
import hrtech.shared.services.AiServiceClient;
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
    private static final double RELATED_TO_MATCH = 0.7;
    private static final double PARENT_OF_MATCH = 0.6;

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

    // ========== Candidate: Recommend Jobs for a CV ==========

    @Override
    @Transactional(readOnly = true)
    public List<JobRecommendationResponse> recommendJobsForCv(UUID cvId, int limit) {
        Cv cv = cvService.getCvEntityById(cvId);
        UUID userId = cv.getUser().getId();

        // Check Feature Access & Deduct Token
        if (!creditService.hasCandidateFeatureAccess(userId, "RECOMMEND_JOB")) {
            throw new AppException(ErrorCode.FORBIDDEN,
                    "Gói của bạn không có tính năng Gợi ý Job (RECOMMEND_JOB) hoặc không đủ AI Credit. Vui lòng nâng cấp gói.");
        }
        creditService.deductCandidateQuota(userId, "RECOMMEND_JOB", 1);

        // 1. Build CV skill map & expand through graph (3 Neo4j queries)
        Map<String, CvSkill> cvSkillMap = buildSkillMap(cv.getCvSkills());
        Set<String> cvSkillIds = cvSkillMap.keySet();
        Map<String, Map<String, Set<String>>> expandedPairMap = expandSkillsThroughGraph(cvSkillIds);

        // 2. Scan all Jobs
        List<Job> allJobs = jobService.getAllJobEntities();
        List<JobRecommendationResponse> recommendations = new ArrayList<>();

        for (Job job : allJobs) {
            List<JobSkill> jobSkills = job.getJobSkills();
            if (jobSkills == null || jobSkills.isEmpty()) {
                continue;
            }

            CompanyWeights weights = extractCompanyWeights(job);
            Set<String> jobSkillIds = jobSkills.stream()
                    .map(JobSkill::getSkillNeo4jId).filter(Objects::nonNull).collect(Collectors.toSet());

            // Resolve: which job skills have graph matches? (in-memory, no DB query)
            Map<String, Set<String>> jobSkillMatchMap = resolveJobSkillMatches(
                    expandedPairMap, cvSkillIds, jobSkillIds, false);

            double matchScore = calculateGraphScore(cvSkillMap, jobSkills, jobSkillMatchMap, weights);

            Map<String, String> skillNameMap = fetchSkillNames(jobSkillIds);
            List<String> matchedSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();
            categorizeSkills(cvSkillIds, jobSkills, jobSkillMatchMap, skillNameMap, matchedSkills, missingSkills);

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
                .sorted(Comparator.comparingDouble((JobRecommendationResponse r) -> r.getMatchScore()).reversed())
                .limit(limit)
                .toList();
    }

    // ========== 1:1 Match Score (CV vs Job) ==========

    @Override
    @Transactional(readOnly = true)
    public SkillMatchScoreResponse calculateMatchScore(UUID cvId, UUID jobId) {
        Cv cv = cvService.getCvEntityById(cvId);
        Job job = jobService.getJobEntityById(jobId);

        Map<String, CvSkill> cvSkillMap = buildSkillMap(cv.getCvSkills());
        Set<String> cvSkillIds = cvSkillMap.keySet();
        Map<String, Map<String, Set<String>>> expandedPairMap = expandSkillsThroughGraph(cvSkillIds);

        List<JobSkill> jobSkills = job.getJobSkills();
        CompanyWeights weights = extractCompanyWeights(job);
        Set<String> jobSkillIds = jobSkills.stream()
                .map(JobSkill::getSkillNeo4jId).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<String, Set<String>> jobSkillMatchMap = resolveJobSkillMatches(
                expandedPairMap, cvSkillIds, jobSkillIds, false);

        double matchScore = calculateGraphScore(cvSkillMap, jobSkills, jobSkillMatchMap, weights);

        Map<String, String> skillNameMap = fetchSkillNames(jobSkillIds);
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        categorizeSkills(cvSkillIds, jobSkills, jobSkillMatchMap, skillNameMap, matchedSkills, missingSkills);

        List<SkillMatchDetail> details = buildSkillMatchDetails(cvSkillMap, jobSkills, jobSkillMatchMap, skillNameMap);

        return SkillMatchScoreResponse.builder()
                .overallScore(Math.round(matchScore * 100.0) / 100.0)
                .grade(getGrade(matchScore))
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .skillDetails(details)
                .build();
    }

    // ========== Premium AI Matching ==========

    @Override
    public AiMatchHistoryResponse performPremiumAiMatching(UUID cvId, UUID jobId) {
        UUID userId = authUtils.getCurrentUserId();
        // Check Feature Access
        if (!creditService.hasCandidateFeatureAccess(userId, "AI_MATCHING")) {
            throw new AppException(ErrorCode.FORBIDDEN,
                    "Gói của bạn không có tính năng AI Matching. Vui lòng nâng cấp.");
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
            // Check Feature Access & Deduct Token (AI_MATCHING)
            if (!creditService.hasCandidateFeatureAccess(userId, "AI_MATCHING")) {
                throw new AppException(ErrorCode.FORBIDDEN,
                        "Gói của bạn không có tính năng Chấm điểm CV (AI_MATCHING) hoặc không đủ AI Credit. Vui lòng nâng cấp gói.");
            }
            creditService.deductCandidateQuota(userId, "AI_MATCHING", 1);

            // Call AI Service
            AiMatchingAdviceResponseDto advice = aiServiceClient.getMatchingAdvice(cv.getParsedContent(),
                    job.getDescription() + "\n" + job.getRequirements(), matchScore.getMissingSkills());

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

    // ========== HR: Recommend Candidates for a Job ==========

    @Override
    @Transactional(readOnly = true)
    public List<CandidateRecommendationResponse> recommendCandidatesForJob(UUID jobId) {
        UUID hrUserId = authUtils.getCurrentUserId();

        Job job = jobService.getJobEntityById(jobId);
        if (job.getCompany() == null) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Công việc này không liên kết với công ty nào.");
        }
        UUID companyId = job.getCompany().getId();

        // Feature gate check (expects companyId)
        if (!creditService.hasCompanyFeatureAccess(companyId, "RECOMMEND_CANDIDATE")) {
            throw new AppException(ErrorCode.FORBIDDEN,
                    "Gói của công ty không có tính năng Gợi ý Ứng Viên (RECOMMEND_CANDIDATE) hoặc không đủ AI Credit. Vui lòng nâng cấp gói.");
        }
        // Deduct AI credit (expects hrUserId to find the company member)
        creditService.deductCompanyFeatureQuota(hrUserId, "RECOMMEND_CANDIDATE", 1);

        List<JobSkill> jobSkills = job.getJobSkills();
        if (jobSkills == null || jobSkills.isEmpty()) {
            return Collections.emptyList();
        }
        CompanyWeights weights = extractCompanyWeights(job);

        // 1. Expand Job skills through the graph (3 Neo4j queries only)
        Set<String> jobSkillIds = jobSkills.stream()
                .map(JobSkill::getSkillNeo4jId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<String, Map<String, Set<String>>> expandedPairMap = expandSkillsThroughGraph(jobSkillIds);

        // Pre-fetch skill names (1 Neo4j query)
        Map<String, String> skillNameMap = fetchSkillNames(jobSkillIds);

        // 2. Scan all CVs (1 SQL query with LEFT JOIN FETCH)
        List<Cv> allCvs = cvService.findAllWithCompletedSkills();

        record CvScore(Cv cv, double score, List<String> matchedSkills, List<String> missingSkills) {}
        Map<UUID, CvScore> bestPerUser = new HashMap<>();

        for (Cv cv : allCvs) {
            if (cv.getUser() == null) continue;
            UUID userId = cv.getUser().getId();

            List<CvSkill> cvSkills = cv.getCvSkills();
            if (cvSkills == null || cvSkills.isEmpty()) continue;

            Map<String, CvSkill> cvSkillMap = buildSkillMap(cvSkills);
            Set<String> cvSkillIds = cvSkillMap.keySet();

            // Resolve matches: invertDirection=true (expanded from Job side)
            Map<String, Set<String>> jobSkillMatchMap = resolveJobSkillMatches(
                    expandedPairMap, cvSkillIds, jobSkillIds, true);

            // Zero DB query calculation (completely in memory)
            double score = calculateGraphScore(cvSkillMap, jobSkills, jobSkillMatchMap, weights);

            if (score <= 0.0) continue;

            List<String> matchedSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();
            categorizeSkills(cvSkillIds, jobSkills, jobSkillMatchMap, skillNameMap, matchedSkills, missingSkills);

            CvScore candidate = new CvScore(cv, score, matchedSkills, missingSkills);
            bestPerUser.merge(userId, candidate, (existing, newer) ->
                    newer.score() > existing.score() ? newer : existing);
        }

        // Sort by score desc, limit results to top 10
        return bestPerUser.values().stream()
                .sorted(Comparator.comparingDouble(CvScore::score).reversed())
                .limit(10)
                .map(cs -> {
                    var user = cs.cv().getUser();
                    String fullName = (user.getFirstName() != null ? user.getFirstName() : "")
                            + " " + (user.getLastName() != null ? user.getLastName() : "");
                    return CandidateRecommendationResponse.builder()
                            .userId(user.getId())
                            .candidateName(fullName.trim())
                            .avatarUrl(user.getAvatarUrl())
                            .email(user.getEmail())
                            .bestCvId(cs.cv().getId())
                            .bestCvTitle(cs.cv().getTitle())
                            .bestCvFileUrl(cs.cv().getFileUrl())
                            .matchScore(Math.round(cs.score() * 100.0) / 100.0)
                            .matchGrade(getGrade(cs.score()))
                            .matchedSkills(cs.matchedSkills())
                            .missingSkills(cs.missingSkills())
                            .build();
                })
                .toList();
    }

    // ========== SHARED PRIVATE HELPER METHODS ==========

    private record CompanyWeights(
            double relatedWeight,
            double parentOfWeight) {
    }

    /**
     * Build a map from skillNeo4jId → CvSkill for quick lookup.
     */
    private Map<String, CvSkill> buildSkillMap(List<CvSkill> cvSkills) {
        if (cvSkills == null || cvSkills.isEmpty()) {
            return Collections.emptyMap();
        }
        return cvSkills.stream()
                .collect(Collectors.toMap(CvSkill::getSkillNeo4jId, s -> s, (a, b) -> a));
    }

    private Map<String, String> fetchSkillNames(Set<String> skillIds) {
        Map<String, String> nameMap = new HashMap<>();
        if (skillIds == null || skillIds.isEmpty()) return nameMap;
        try {
            Iterable<SkillNode> nodes = skillNodeRepository.findAllById(skillIds);
            for (SkillNode node : nodes) {
                nameMap.put(node.getId(), node.getName());
            }
        } catch (Exception e) {
            log.warn("Could not batch load skill names: {}", e.getMessage());
        }
        return nameMap;
    }

    private CompanyWeights extractCompanyWeights(Job job) {
        double jobRelatedWeight = RELATED_TO_MATCH;
        double jobParentOfWeight = PARENT_OF_MATCH;

        if (job.getCompany() != null) {
            if (job.getCompany().getRelatedWeight() != null)
                jobRelatedWeight = job.getCompany().getRelatedWeight();
            if (job.getCompany().getParentOfWeight() != null)
                jobParentOfWeight = job.getCompany().getParentOfWeight();
        }

        return new CompanyWeights(jobRelatedWeight, jobParentOfWeight);
    }

    /**
     * Expand skill IDs through graph relationships.
     * Returns: sourceSkillId → targetSkillId → Set of relationship types.
     * Preserves the source→target linkage for accurate per-skill resolution.
     * Uses batch Neo4j queries (exactly 2 roundtrips regardless of input size).
     */
    private Map<String, Map<String, Set<String>>> expandSkillsThroughGraph(Set<String> originalSkillIds) {
        Map<String, Map<String, Set<String>>> expanded = new HashMap<>();
        if (originalSkillIds == null || originalSkillIds.isEmpty()) {
            return expanded;
        }

        try {
            List<SkillRelationResponse> related = skillNodeRepository.findRelatedPairs(originalSkillIds);
            for (SkillRelationResponse r : related) {
                expanded.computeIfAbsent(r.getSourceId(), k -> new HashMap<>())
                        .computeIfAbsent(r.getTargetId(), k -> new HashSet<>())
                        .add("RELATED_TO");
            }
        } catch (Exception e) {
            log.warn("Could not batch expand related skills: {}", e.getMessage());
        }

        try {
            List<SkillRelationResponse> parentOf = skillNodeRepository.findParentOfPairs(originalSkillIds);
            for (SkillRelationResponse p : parentOf) {
                expanded.computeIfAbsent(p.getSourceId(), k -> new HashMap<>())
                        .computeIfAbsent(p.getTargetId(), k -> new HashSet<>())
                        .add("PARENT_OF");
            }
        } catch (Exception e) {
            log.warn("Could not batch expand parent_of skills: {}", e.getMessage());
        }

        return expanded;
    }

    /**
     * Resolve the expanded pair map into a per-job-skill match map.
     * Result: jobSkillId → Set of relationship types that match.
     *
     * @param expandedPairMap  sourceId → targetId → types (from expandSkillsThroughGraph)
     * @param cvSkillIds       set of CV skill IDs
     * @param jobSkillIds      set of Job skill IDs
     * @param invertDirection  false = expanded from CV skills, true = expanded from Job skills
     */
    private Map<String, Set<String>> resolveJobSkillMatches(
            Map<String, Map<String, Set<String>>> expandedPairMap,
            Set<String> cvSkillIds,
            Set<String> jobSkillIds,
            boolean invertDirection) {

        Map<String, Set<String>> result = new HashMap<>();

        if (!invertDirection) {
            // Expanded from CV skills: source=cvSkill, target=anySkill
            // → If a jobSkillId appears as a target, it means a CV skill can reach it
            for (Map<String, Set<String>> targets : expandedPairMap.values()) {
                for (Map.Entry<String, Set<String>> targetEntry : targets.entrySet()) {
                    if (jobSkillIds.contains(targetEntry.getKey())) {
                        result.computeIfAbsent(targetEntry.getKey(), k -> new HashSet<>())
                                .addAll(targetEntry.getValue());
                    }
                }
            }
        } else {
            // Expanded from Job skills: source=jobSkill, target=anySkill
            // → If a cvSkillId appears as a target of a specific jobSkill, it's a match
            for (Map.Entry<String, Map<String, Set<String>>> sourceEntry : expandedPairMap.entrySet()) {
                String jobSkillId = sourceEntry.getKey();
                for (Map.Entry<String, Set<String>> targetEntry : sourceEntry.getValue().entrySet()) {
                    if (cvSkillIds.contains(targetEntry.getKey())) {
                        result.computeIfAbsent(jobSkillId, k -> new HashSet<>())
                                .addAll(targetEntry.getValue());
                    }
                }
            }
        }

        return result;
    }


    /**
     * Calculate graph-based matching score (unified for both RCM Job and RCM Candidate).
     * Score = Σ(matchWeight × levelScore) / Σ(totalWeight)
     *
     * @param cvSkillMap       CV skill map: skillNeo4jId → CvSkill
     * @param jobSkills        list of required job skills
     * @param jobSkillMatchMap per-job-skill graph match map: jobSkillId → types
     * @param weights          company-configured weights
     */
    private double calculateGraphScore(
            Map<String, CvSkill> cvSkillMap,
            List<JobSkill> jobSkills,
            Map<String, Set<String>> jobSkillMatchMap,
            CompanyWeights weights) {

        double totalWeight = 0.0;
        double matchedWeight = 0.0;

        for (JobSkill jobSkill : jobSkills) {
            double weight = Boolean.FALSE.equals(jobSkill.getIsAiExtracted()) ? 1.0 : 0.5;
            totalWeight += weight;

            String jId = jobSkill.getSkillNeo4jId();

            if (cvSkillMap.containsKey(jId)) {
                // EXACT match
                CvSkill cvSkill = cvSkillMap.get(jId);
                double levelScore = calculateLevelScore(cvSkill.getProficiencyLevel(), jobSkill.getRequiredLevel());
                matchedWeight += weight * EXACT_MATCH * levelScore;
            } else if (jobSkillMatchMap.containsKey(jId)) {
                // GRAPH match (RELATED_TO / PARENT_OF)
                double maxMultiplier = 0.0;
                for (String type : jobSkillMatchMap.get(jId)) {
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
            case "RELATED_TO" -> weights.relatedWeight();
            case "PARENT_OF" -> weights.parentOfWeight();
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
     * Categorize job skills into matched and missing lists (unified for both flows).
     */
    private void categorizeSkills(
            Set<String> cvSkillIds,
            List<JobSkill> jobSkills,
            Map<String, Set<String>> jobSkillMatchMap,
            Map<String, String> skillNameMap,
            List<String> matchedSkills,
            List<String> missingSkills) {

        for (JobSkill jobSkill : jobSkills) {
            String jId = jobSkill.getSkillNeo4jId();
            String skillName = skillNameMap.getOrDefault(jId, jId);

            if (cvSkillIds.contains(jId) || jobSkillMatchMap.containsKey(jId)) {
                matchedSkills.add(skillName);
            } else {
                missingSkills.add(skillName);
            }
        }
    }

    /**
     * Build detailed skill match information for each job skill.
     */
    private List<SkillMatchDetail> buildSkillMatchDetails(
            Map<String, CvSkill> cvSkillMap,
            List<JobSkill> jobSkills,
            Map<String, Set<String>> jobSkillMatchMap,
            Map<String, String> skillNameMap) {

        List<SkillMatchDetail> details = new ArrayList<>();

        for (JobSkill jobSkill : jobSkills) {
            String neo4jId = jobSkill.getSkillNeo4jId();
            String skillName = skillNameMap.getOrDefault(neo4jId, neo4jId);

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
            } else if (jobSkillMatchMap.containsKey(neo4jId)) {
                matchType = String.join(", ", jobSkillMatchMap.get(neo4jId));
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