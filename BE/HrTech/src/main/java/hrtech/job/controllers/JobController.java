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
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.shared.response.ApiResponse;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import java.util.List;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final IJobService jobService;

    @GetMapping("/landing-stats")
    public ResponseEntity<ApiResponse<LandingStatsResponse>> getLandingStats() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getLandingStats()));
    }

    @GetMapping("/hot-positions")
    public ResponseEntity<ApiResponse<List<HotPositionResponse>>> getHotPositions(
            @RequestParam(defaultValue = "6") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getHotPositions(limit)));
    }

    @GetMapping("/trending-skills")
    public ResponseEntity<ApiResponse<List<TrendingSkillResponse>>> getTrendingSkills(
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getTrendingSkills(limit)));
    }

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
    @PreAuthorize("@jobSecurity.hasJobRole(#id, 'OWNER', 'HR_MANAGER', 'HR')")
    public ResponseEntity<ApiResponse<JobResponse>> updateOwnJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.updateOwnJob(id, request)));
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("@jobSecurity.isJobCreatorOrHr(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> submitJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.submitJob(id)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("@jobSecurity.isJobManager(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> approveJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.approveJob(id)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("@jobSecurity.isJobManager(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> rejectJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.rejectJob(id)));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("@jobSecurity.isJobCreatorOrManager(#id)")
    public ResponseEntity<ApiResponse<JobResponse>> closeJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.closeJob(id)));
    }
}
