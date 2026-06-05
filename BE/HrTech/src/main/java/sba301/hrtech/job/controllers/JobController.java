package sba301.hrtech.job.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSearchCriteria;
import sba301.hrtech.job.dtos.response.JobResponse;

import java.math.BigDecimal;
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

    /**
     * Public search — returns only OPEN jobs.
     * No authentication required.
     */
    @GetMapping
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) BigDecimal salaryMin,
            @RequestParam(required = false) BigDecimal salaryMax,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        JobSearchCriteria criteria = new JobSearchCriteria(
                keyword, location, experienceLevel, jobType, salaryMin, salaryMax
        );
        return ResponseEntity.ok(jobService.searchJobs(criteria, pageable));
    }

    /**
     * View any single job's details.
     * The service enforces visibility rules if needed.
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getJobDetails(id));
    }

    /**
     * HR creates a new job (status = DRAFT).
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.createJob(request);
        return ResponseEntity
                .created(URI.create("/api/jobs/" + response.id()))
                .body(response);
    }

    /**
     * HR updates their own DRAFT job.
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobResponse> updateOwnJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request
    ) {
        return ResponseEntity.ok(jobService.updateOwnJob(id, request));
    }

    /**
     * HR submits their DRAFT job for approval (DRAFT -> PENDING).
     */
    @PatchMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobResponse> submitJob(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.submitJob(id));
    }
}
