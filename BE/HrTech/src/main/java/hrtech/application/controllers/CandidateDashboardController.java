package hrtech.application.controllers;

import hrtech.application.dtos.response.*;
import hrtech.application.services.CandidateDashboardService;
import hrtech.identity.utils.AuthUtils;
import hrtech.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateDashboardController {

        private final CandidateDashboardService dashboardService;
        private final AuthUtils authUtils;

        @GetMapping("/dashboard-summary")
        public ResponseEntity<ApiResponse<CandidateDashboardSummaryResponse>> getDashboardSummary() {
                UUID userId = authUtils.getCurrentUserId();
                return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardSummary(userId)));
        }

        @GetMapping("/recent-activities")
        public ResponseEntity<ApiResponse<List<RecentActivityResponse>>> getRecentActivities(
                        @RequestParam(defaultValue = "5") int limit) {
                UUID userId = authUtils.getCurrentUserId();
                return ResponseEntity.ok(ApiResponse.success(dashboardService.getRecentActivities(userId, limit)));
        }

        @GetMapping("/upcoming-interviews")
        public ResponseEntity<ApiResponse<List<UpcomingInterviewResponse>>> getUpcomingInterviews() {
                UUID userId = authUtils.getCurrentUserId();
                return ResponseEntity.ok(ApiResponse.success(dashboardService.getUpcomingInterviews(userId)));
        }

        @GetMapping("/job-search-analytics")
        public ResponseEntity<ApiResponse<JobSearchAnalyticsResponse>> getJobSearchAnalytics() {
                UUID userId = authUtils.getCurrentUserId();
                return ResponseEntity.ok(ApiResponse.success(dashboardService.getJobSearchAnalytics(userId)));
        }
}
