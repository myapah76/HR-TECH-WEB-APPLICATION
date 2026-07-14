package hrtech.candidate.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import hrtech.candidate.abstractions.services.CandidateService;
import hrtech.candidate.dtos.CandidateDashboardSummaryResponse;
import hrtech.candidate.dtos.RecentActivityResponse;
import hrtech.candidate.dtos.UpcomingInterviewResponse;
import hrtech.identity.utils.AuthUtils;
import hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final AuthUtils authUtils;

    @GetMapping("/dashboard-summary")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CandidateDashboardSummaryResponse>> getDashboardSummary() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getCandidateDashboardSummary(currentUserId)));
    }

    @GetMapping("/recent-activities")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<RecentActivityResponse>>> getRecentActivities(
            @RequestParam(defaultValue = "5") int limit) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getRecentActivities(currentUserId, limit)));
    }

    @GetMapping("/upcoming-interviews")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<UpcomingInterviewResponse>>> getUpcomingInterviews() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(candidateService.getUpcomingInterviews(currentUserId)));
    }
}
