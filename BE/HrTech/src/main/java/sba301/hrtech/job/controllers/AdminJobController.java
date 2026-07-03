package sba301.hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.shared.response.ApiResponse;

import java.util.UUID;

/**
 * Admin-only job management endpoints.
 * All endpoints are protected by hasRole('ADMIN_SYSTEM') at class level.
 *
 * State transitions available to admin:
 *  - PENDING_APPROVAL → APPROVED  (approve)
 *  - PENDING_APPROVAL → REJECTED  (reject, requires reason)
 *  - APPROVED         → CLOSED    (close)
 *
 * NOTE: submit (DRAFT → PENDING_APPROVAL) is intentionally excluded —
 * that action belongs to the HR/recruiter, not the admin.
 */
@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_SYSTEM')")
public class AdminJobController {

    private final IJobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getJobsForAdmin(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobsForAdmin(keyword, status, pageable)));
    }

    /** PENDING_APPROVAL → APPROVED */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<JobResponse>> adminApproveJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.approveJob(id)));
    }

    /** PENDING_APPROVAL → REJECTED */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<JobResponse>> adminRejectJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.rejectJob(id)));
    }

    /** APPROVED → CLOSED */
    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<JobResponse>> adminCloseJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.closeJob(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> adminDeleteJob(@PathVariable UUID id) {
        jobService.adminDeleteJob(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
