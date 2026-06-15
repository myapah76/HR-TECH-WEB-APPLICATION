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
import sba301.hrtech.job.entities.JobDocument;
import sba301.hrtech.shared.common.ApiResponse;

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

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
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
        return ResponseEntity.ok(ApiResponse.success(jobService.searchJobs(criteria, pageable)));
    }


    @GetMapping("/elastic")
    public ResponseEntity<ApiResponse<Page<JobDocument>>> searchJobs(@RequestParam String keyword, Pageable pageable)
    {
        return ResponseEntity.ok(ApiResponse.success(jobService.searchJobsWithElasticsearch(keyword, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobDetails(id)));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(@Valid @RequestBody JobRequest request) {
        JobResponse response = jobService.createJob(request);
        return ResponseEntity
                .created(URI.create("/api/jobs/" + response.id()))
                .body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<JobResponse>> updateOwnJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.updateOwnJob(id, request)));
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<JobResponse>> submitJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.submitJob(id)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<JobResponse>> approveJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.approveJob(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<JobResponse>> rejectJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.rejectJob(id)));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<JobResponse>> closeJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.closeJob(id)));
    }
}
