package hrtech.job.controllers;

import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSearchCriteria;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
import hrtech.application.abstractions.services.IApplicationService;
import hrtech.company.dtos.response.RecruiterActiveJobResponse;
import hrtech.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class JobController {

    private final IJobService jobService;
    private final IApplicationService applicationService;

    // ─── Public ──────────────────────────────────────────────────────────────────

    @GetMapping("/jobs/landing-stats")
    public ResponseEntity<ApiResponse<LandingStatsResponse>> getLandingStats() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getLandingStats()));
    }

    @GetMapping("/jobs/hot-positions")
    public ResponseEntity<ApiResponse<List<HotPositionResponse>>> getHotPositions(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getHotPositions(limit)));
    }

    @GetMapping("/jobs/trending-skills")
    public ResponseEntity<ApiResponse<List<TrendingSkillResponse>>> getTrendingSkills(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getTrendingSkills(limit)));
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> searchJobs(
            @Valid JobSearchCriteria criteria,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.searchJobs(criteria, pageable)));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> listJobs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.listJobs(pageable)));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobDetails(id)));
    }

    @GetMapping("/companies/{companyId}/jobs")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getPublicCompanyJobs(
            @PathVariable UUID companyId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getPublicCompanyJobs(companyId, pageable)));
    }

    // ─── Recruiter Dashboard ─────────────────────────────────────────────────────

    @GetMapping("/jobs/recruiter/dashboard/active-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<RecruiterActiveJobResponse>>> getRecruiterActiveJobs() {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getRecruiterActiveJobs()));
    }

    // ─── Recruiter Job Management ─────────────────────────────────────────────────

    @GetMapping("/recruiter/companies/{companyId}/jobs")
    @PreAuthorize("@companySecurity.isRecruiter(#companyId)")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getManageCompanyJobs(
            @PathVariable UUID companyId,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) ExperienceLevel jobLevel,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getManageCompanyJobs(companyId, status, jobType, jobLevel, pageable)));
    }

    @PostMapping("/recruiter/companies/{companyId}/jobs")
    @PreAuthorize("@companySecurity.isRecruiter(#companyId)")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @PathVariable UUID companyId,
            @Valid @RequestBody JobRequest request) {
        if (!companyId.equals(request.companyId())) {
            throw new IllegalArgumentException("Company context mismatch");
        }
        JobResponse response = jobService.createJob(request);
        return ResponseEntity
                .created(URI.create("/api/jobs/" + response.id()))
                .body(ApiResponse.success(response));
    }

    @PutMapping("/recruiter/companies/{companyId}/jobs/{jobId}")
    @PreAuthorize("@companySecurity.isRecruiter(#companyId) and @jobSecurity.isJobCreatorOrManager(#jobId)")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable UUID companyId,
            @PathVariable UUID jobId,
            @Valid @RequestBody JobRequest request) {
        if (!companyId.equals(request.companyId())) {
            throw new IllegalArgumentException("Company context mismatch");
        }
        return ResponseEntity.ok(ApiResponse.success(jobService.updateJob(jobId, request)));
    }

    @PutMapping("/recruiter/companies/{companyId}/jobs/{jobId}/{action}")
    @PreAuthorize("@companySecurity.isRecruiter(#companyId) and @jobSecurity.canPerformAction(#jobId, #action)")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable UUID companyId,
            @PathVariable UUID jobId,
            @PathVariable String action) {
        JobResponse response = switch (action.toLowerCase()) {
            case "submit" -> jobService.submitJob(jobId);
            case "approve" -> jobService.approveJob(jobId);
            case "reject" -> jobService.rejectJob(jobId);
            case "close" -> jobService.closeJob(jobId);
            case "appeal" -> jobService.appealJob(jobId);
            default -> throw new IllegalArgumentException("Invalid action: " + action);
        };
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ─── Admin ───────────────────────────────────────────────────────────────────

    @GetMapping("/admin/jobs")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getJobReport(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobReport(keyword, pageable)));
    }

    @PutMapping("/admin/jobs/{id}/approve-appeal")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<JobResponse>> approveAppeal(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.approveAppeal(id)));
    }

    @PutMapping("/admin/jobs/{id}/reject-appeal")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<JobResponse>> rejectAppeal(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.rejectAppeal(id)));
    }
}
