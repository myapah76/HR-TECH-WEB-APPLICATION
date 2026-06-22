package sba301.hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

/**
 * Internal company endpoints — approval workflow + company job management.
 * All endpoints require authentication.
 * Actual role checks (HR_MANAGER / OWNER) are enforced in the service layer
 * directly on User.role and User.company — no intermediate join table needed.
 */
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CompanyJobController {

    private final IJobService jobService;

    @GetMapping("/{companyId}/jobs/pending")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getPendingJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getPendingJobs(companyId)));
    }

    @GetMapping("/{companyId}/jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getCompanyJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getCompanyJobs(companyId)));
    }

    @GetMapping("/{companyId}/jobs/manage")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getManageJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getManageJobs(companyId)));
    }

    @GetMapping("/{companyId}/jobs/me")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getMyJobs(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getMyJobs(companyId)));
    }
}
