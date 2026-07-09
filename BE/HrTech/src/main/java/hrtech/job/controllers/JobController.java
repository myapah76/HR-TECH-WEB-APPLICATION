package hrtech.job.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.JobResponse;
import hrtech.shared.response.ApiResponse;

import java.net.URI;
import java.util.UUID;

/**
 * Public-facing + HR endpoints.
 * - Candidates: GET /api/jobs (search OPEN only), GET /api/jobs/{id}
 * - HR: POST (create), PUT (update own draft), PATCH (submit for approval)
 */
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final IJobService jobService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
            @Valid JobSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.searchJobs(criteria, pageable)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> listJobs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.listJobs(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobDetails(id)));
    }

    @PostMapping
    @PreAuthorize("@companySecurity.hasRole(#p0.companyId(), 'OWNER', 'HR_MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.createJob(request);
        return ResponseEntity
                .created(URI.create("/api/jobs/" + response.id()))
                .body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@companySecurity.hasJobRole(#id, 'OWNER', 'HR_MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<JobResponse>> updateOwnJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.updateOwnJob(id, request)));
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("@companySecurity.isJobCreatorOrHr(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> submitJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.submitJob(id)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("@companySecurity.isJobManager(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> approveJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.approveJob(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("@companySecurity.isJobManager(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> rejectJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.rejectJob(id)));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("@companySecurity.isJobCreatorOrManager(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> closeJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.closeJob(id)));
    }
}
