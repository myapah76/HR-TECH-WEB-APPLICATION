package hrtech.application.controllers;

import hrtech.application.dtos.response.*;
import hrtech.shared.dtos.RecentActivityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.dtos.request.SubmitApplicationRequest;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.identity.utils.AuthUtils;
import hrtech.shared.response.ApiResponse;
import hrtech.company.dtos.response.RecruiterDashboardSummaryResponse;
import hrtech.company.dtos.response.RecruiterUpcomingInterviewResponse;
import hrtech.company.dtos.response.RecruiterAnalyticsResponse;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final IApplicationService applicationService;
    private final AuthUtils authUtils;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationSummaryResponse>> submitApplication(
            @Valid @RequestBody SubmitApplicationRequest request) {
        UUID currentUserId = authUtils.getCurrentUserId();
        ApplicationSummaryResponse response = applicationService.submitApplication(currentUserId, request);
        return ResponseEntity
                .created(URI.create("/api/applications/" + response.getId()))
                .body(ApiResponse.success(response, "Ứng tuyển thành công"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Page<ApplicationSummaryResponse>>> getMyApplications(
            @PageableDefault(size = 10, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getMyApplications(currentUserId, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplicationDetail(
            @PathVariable UUID id) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationDetail(currentUserId, id)));
    }

    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(@PathVariable UUID id) {
        UUID currentUserId = authUtils.getCurrentUserId();
        applicationService.withdrawApplication(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Rút hồ sơ thành công"));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("@applicationSecurity.isApplicationOwnerOrManagerOrHr(#id)")
    public ResponseEntity<ApiResponse<ApplicationSummaryResponse>> acceptApplication(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.acceptApplication(id),
                "Duyệt đơn ứng tuyển thành công"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("@applicationSecurity.isApplicationOwnerOrManagerOrHr(#id)")
    public ResponseEntity<ApiResponse<ApplicationSummaryResponse>> rejectApplication(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.rejectApplication(id),
                "Đã từ chối/loại đơn ứng tuyển thành công"));
    }



    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("@jobSecurity.hasJobRole(#jobId, 'OWNER', 'HR_MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<Page<ApplicationSummaryResponse>>> getApplicationsByJob(
            @PathVariable UUID jobId,
            @RequestParam(required = false) ApplicationStatus status,
            @PageableDefault(size = 10, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationsByJob(jobId, status, pageable)));
    }

    @PostMapping("/{id}/score")
    @PreAuthorize("isAuthenticated()") // Could be Candidate or HR
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> scoreApplication(
            @PathVariable UUID id) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(
                ApiResponse.success(applicationService.scoreApplication(currentUserId, id), "Chấm điểm thành công"));
    }

    @GetMapping("/check")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> checkHasApplied(@RequestParam UUID jobId) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.hasApplied(currentUserId, jobId)));
    }

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationDashboardSummaryResponse>> getDashboardSummary() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationDashboardSummary(currentUserId)));
    }

    @GetMapping("/dashboard/recent-activities")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<RecentActivityResponse>>> getRecentActivities(
            @RequestParam(defaultValue = "5") int limit) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecentApplicationsForDashboard(currentUserId, limit)));
    }

    @GetMapping("/dashboard/upcoming-interviews")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<UpcomingInterviewResponse>>> getUpcomingInterviews() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getUpcomingInterviewsForDashboard(currentUserId)));
    }

    @GetMapping("/dashboard/job-search-analytics")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<JobSearchAnalyticsResponse>> getJobSearchAnalytics() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getJobSearchAnalytics(currentUserId)));
    }

    @GetMapping("/recruiter/dashboard/summary")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterDashboardSummaryResponse>> getRecruiterDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterDashboardSummary()));
    }

    @GetMapping("/recruiter/dashboard/upcoming-interviews")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<RecruiterUpcomingInterviewResponse>>> getRecruiterUpcomingInterviews() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterUpcomingInterviews()));
    }

    @GetMapping("/recruiter/dashboard/analytics")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterAnalyticsResponse>> getRecruiterAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterAnalytics()));
    }
}
