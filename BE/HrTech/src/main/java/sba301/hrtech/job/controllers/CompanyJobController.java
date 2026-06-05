package sba301.hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.dtos.response.JobResponse;

import java.util.List;
import java.util.UUID;

/**
 * Internal company endpoints — approval workflow + company job management.
 * All endpoints require authentication.
 * Actual role checks (HR_MANAGER / OWNER) are enforced in the service layer
 * using CompanyMember, NOT Spring Security roles.
 */
@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CompanyJobController {

    private final IJobService jobService;

    /**
     * HR_MANAGER: Get all PENDING jobs awaiting approval for a company.
     */
    @GetMapping("/{companyId}/jobs/pending")
    public ResponseEntity<List<JobResponse>> getPendingJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(jobService.getPendingJobs(companyId));
    }

    /**
     * OWNER / HR_MANAGER: View all jobs in a company (all statuses).
     */
    @GetMapping("/{companyId}/jobs")
    public ResponseEntity<List<JobResponse>> getCompanyJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(jobService.getCompanyJobs(companyId));
    }

    /**
     * HR: View own jobs in a company.
     */
    @GetMapping("/{companyId}/jobs/mine")
    public ResponseEntity<List<JobResponse>> getMyJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(jobService.getMyJobs(companyId));
    }

    /**
     * HR_MANAGER: Approve a PENDING job (PENDING -> OPEN).
     */
    @PatchMapping("/jobs/{jobId}/approve")
    public ResponseEntity<JobResponse> approveJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(jobService.approveJob(jobId));
    }

    /**
     * HR_MANAGER: Reject a PENDING job (PENDING -> DRAFT).
     */
    @PatchMapping("/jobs/{jobId}/reject")
    public ResponseEntity<JobResponse> rejectJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(jobService.rejectJob(jobId));
    }

    /**
     * OWNER or HR_MANAGER: Close an OPEN job (OPEN -> CLOSED).
     */
    @PatchMapping("/jobs/{jobId}/close")
    public ResponseEntity<JobResponse> closeJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(jobService.closeJob(jobId));
    }
}
