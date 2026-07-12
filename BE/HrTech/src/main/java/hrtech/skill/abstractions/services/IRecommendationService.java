package hrtech.skill.abstractions.services;

import hrtech.skill.dtos.response.AiMatchHistoryResponse;
import hrtech.skill.dtos.response.CandidateRecommendationResponse;
import hrtech.skill.dtos.response.JobRecommendationResponse;
import hrtech.skill.dtos.response.RecommendationResultResponse;
import hrtech.skill.dtos.response.SkillMatchScoreResponse;

import java.util.List;
import java.util.UUID;

public interface IRecommendationService {

    /**
     * Full flow: Extract skills from CV → Recommend matching jobs.
     */
    RecommendationResultResponse analyzeCvAndRecommend(UUID cvId, int limit);

    /**
     * Recommend jobs for a CV that already has extracted skills.
     */
    List<JobRecommendationResponse> recommendJobsForCv(UUID cvId, int limit);

    /**
     * Calculate detailed match score between a specific CV and Job.
     */
    SkillMatchScoreResponse calculateMatchScore(UUID cvId, UUID jobId);

    /**
     * Perform premium AI matching (Candidate pre-apply) using LLM and saving history.
     */
    AiMatchHistoryResponse performPremiumAiMatching(UUID cvId, UUID jobId);

    /**
     * Recommend candidates (by best CV per user) for a specific job posting.
     * For HR side – Company subscription gated.
     */
    List<CandidateRecommendationResponse> recommendCandidatesForJob(UUID jobId);
}
