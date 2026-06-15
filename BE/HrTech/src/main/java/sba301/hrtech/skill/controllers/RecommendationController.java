package sba301.hrtech.skill.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.shared.response.ApiResponse;
import sba301.hrtech.skill.abstractions.services.IRecommendationService;
import sba301.hrtech.skill.dtos.response.JobRecommendationResponse;
import sba301.hrtech.skill.dtos.response.RecommendationResultResponse;
import sba301.hrtech.skill.dtos.response.SkillMatchScoreResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final IRecommendationService recommendationService;

    /**
     * Full flow: Extract skills from CV → Recommend matching jobs.
     */
    @PostMapping("/cvs/{cvId}/analyze")
    public ResponseEntity<ApiResponse<RecommendationResultResponse>> analyzeCvAndRecommend(
            @PathVariable UUID cvId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.analyzeCvAndRecommend(cvId, limit)));
    }

    /**
     * Recommend jobs for a CV that already has extracted skills.
     */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobRecommendationResponse>>> recommendJobs(
            @RequestParam UUID cvId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.recommendJobsForCv(cvId, limit)));
    }

    /**
     * Calculate detailed match score between a specific CV and Job.
     */
    @GetMapping("/match-score")
    public ResponseEntity<ApiResponse<SkillMatchScoreResponse>> calculateMatchScore(
            @RequestParam UUID cvId,
            @RequestParam UUID jobId) {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.calculateMatchScore(cvId, jobId)));
    }
}
