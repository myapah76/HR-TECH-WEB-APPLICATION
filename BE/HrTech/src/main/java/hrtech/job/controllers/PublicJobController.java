package hrtech.job.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import hrtech.job.abstractions.services.IJobService;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.shared.response.ApiResponse;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.company.dtos.response.RecruiterActiveJobResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicJobController {

    private final IJobService jobService;
    private final IApplicationService applicationService;

    @GetMapping("/jobs/landing-stats")
    public ResponseEntity<ApiResponse<LandingStatsResponse>> getLandingStats() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getLandingStats()));
    }

    @GetMapping("/jobs/hot-positions")
    public ResponseEntity<ApiResponse<List<HotPositionResponse>>> getHotPositions(
            @RequestParam(defaultValue = "6") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getHotPositions(limit)));
    }

    @GetMapping("/jobs/trending-skills")
    public ResponseEntity<ApiResponse<List<TrendingSkillResponse>>> getTrendingSkills(
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getTrendingSkills(limit)));
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
            @Valid JobSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.searchJobs(criteria, pageable)));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> listJobs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.listJobs(pageable)));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobDetails(id)));
    }

    @GetMapping("/companies/{companyId}/jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getPublicCompanyJobs(
            @PathVariable UUID companyId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getPublicCompanyJobs(companyId, pageable)));
    }

    @GetMapping("/jobs/recruiter/dashboard/active-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<RecruiterActiveJobResponse>>> getRecruiterActiveJobs() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterActiveJobs()));
    }
}
