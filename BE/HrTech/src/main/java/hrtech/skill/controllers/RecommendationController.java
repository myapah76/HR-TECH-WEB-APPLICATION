package hrtech.skill.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import hrtech.shared.response.ApiResponse;
import hrtech.skill.abstractions.services.IRecommendationService;
import hrtech.skill.dtos.response.AiMatchHistoryResponse;
import hrtech.skill.dtos.response.CandidateRecommendationResponse;
import hrtech.skill.dtos.response.JobRecommendationResponse;
import hrtech.skill.dtos.response.RecommendationResultResponse;

import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final IRecommendationService recommendationService;

    /**
     * Full flow: Extract skills from CV → Recommend matching jobs.
     */
    @PostMapping("/cvs/{cvId}/analyze")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<RecommendationResultResponse>> analyzeCvAndRecommend(
            @PathVariable UUID cvId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.analyzeCvAndRecommend(cvId, limit)));
    }

    /**
     * Recommend jobs for a CV that already has extracted skills.
     */
    @GetMapping("/jobs")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<JobRecommendationResponse>>> recommendJobs(
            @RequestParam UUID cvId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.recommendJobsForCv(cvId, limit)));
    }

    @PostMapping("/premium-ai-match")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<AiMatchHistoryResponse>> performPremiumAiMatching(
            @RequestParam UUID cvId,
            @RequestParam UUID jobId) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.performPremiumAiMatching(cvId, jobId), "Tư vấn AI thành công"));
    }

    /**
     * Recommend top-matching candidates for a given job posting.
     * For Recruiter role only.
     */
    @GetMapping("/hr/candidates")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<CandidateRecommendationResponse>>> recommendCandidates(
            @RequestParam UUID jobId) {
        return ResponseEntity.ok(
                ApiResponse.success(recommendationService.recommendCandidatesForJob(jobId)));
    }
}
