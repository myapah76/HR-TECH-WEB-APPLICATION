package hrtech.application.controllers;

import hrtech.application.dtos.request.*;
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

    /**
     * Bulk Score: Chấm điểm (và re-score) tất cả application của một job.
     * currentUserId được lấy nội bộ trong Service, không truyền qua Controller.
     */
    @PostMapping("/jobs/{jobId}/bulk-score")
    @PreAuthorize("@jobSecurity.hasJobRole(#jobId, 'OWNER', 'HR_MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<BulkScoreResponse>> bulkScoreByJob(
            @PathVariable UUID jobId,
            @Valid @RequestBody BulkScoreRequest request) {
        BulkScoreResponse result = applicationService.bulkScoreByJob(jobId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Chấm điểm hàng loạt thành công"));
    }

    /**
     * Bulk Reject: Từ chối nhiều application HR đã chọn.
     * currentUserId được lấy nội bộ trong Service, không truyền qua Controller.
     */
    @PostMapping("/bulk-reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ApplicationSummaryResponse>>> bulkRejectApplications(
            @Valid @RequestBody BulkRejectRequest request) {
        List<ApplicationSummaryResponse> result = applicationService.bulkRejectApplications(request.getApplicationIds());
        return ResponseEntity.ok(ApiResponse.success(result, "Từ chối đơn ứng tuyển thành công"));
    }

    // ─── INTERVIEW WORKFLOW ENDPOINTS ───────────────────────────────────────

    @PostMapping("/interview-rounds/schedule-slots")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ApplicationSummaryResponse>>> scheduleMultiSlotInterview(
            @Valid @RequestBody ScheduleMultiSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.scheduleMultiSlotInterview(request),
                "Gửi khung giờ phỏng vấn thành công"
        ));
    }

    @PostMapping("/{applicationId}/interview-rounds/{roundNumber}/select-slot")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationInterviewRoundResponse>> selectInterviewSlot(
            @PathVariable UUID applicationId,
            @PathVariable Integer roundNumber,
            @Valid @RequestBody SelectSlotRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.selectInterviewSlot(applicationId, roundNumber, request),
                "Đã chốt khung giờ phỏng vấn"
        ));
    }

    @PostMapping("/{applicationId}/interview-rounds/{roundNumber}/request-reschedule")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationInterviewRoundResponse>> requestInterviewReschedule(
            @PathVariable UUID applicationId,
            @PathVariable Integer roundNumber,
            @Valid @RequestBody RequestRescheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.requestInterviewReschedule(applicationId, roundNumber, request),
                "Gửi yêu cầu đổi lịch phỏng vấn thành công"
        ));
    }

    @PostMapping("/{applicationId}/interview-rounds/{roundNumber}/review-reschedule")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationInterviewRoundResponse>> reviewInterviewReschedule(
            @PathVariable UUID applicationId,
            @PathVariable Integer roundNumber,
            @Valid @RequestBody ReviewRescheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.reviewInterviewReschedule(applicationId, roundNumber, request),
                "Đã phản hồi yêu cầu đổi lịch của ứng viên"
        ));
    }

    @PostMapping("/{applicationId}/interview-rounds/{roundNumber}/check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationInterviewRoundResponse>> checkInInterviewRound(
            @PathVariable UUID applicationId,
            @PathVariable Integer roundNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.checkInInterviewRound(applicationId, roundNumber),
                "Điểm danh tham dự phỏng vấn thành công"
        ));
    }

    @PostMapping("/{applicationId}/interview-rounds/{roundNumber}/evaluate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationInterviewRoundResponse>> evaluateInterviewRound(
            @PathVariable UUID applicationId,
            @PathVariable Integer roundNumber,
            @Valid @RequestBody EvaluateRoundRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.evaluateInterviewRound(applicationId, roundNumber, request),
                "Chấm điểm và kết quả vòng phỏng vấn thành công"
        ));
    }

    @PostMapping("/{applicationId}/final-confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationSummaryResponse>> finalConfirmInterview(
            @PathVariable UUID applicationId,
            @Valid @RequestBody FinalConfirmationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.finalConfirmInterview(applicationId, request),
                "Đã hoàn thành quyết định tuyển dụng cuối cùng"
        ));
    }

    @GetMapping("/{applicationId}/interview-rounds")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ApplicationInterviewRoundResponse>>> getApplicationInterviewRounds(
            @PathVariable UUID applicationId) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationInterviewRounds(applicationId)));
    }
}
