package hrtech.job.controllers;

import hrtech.job.abstractions.services.IJobService;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.JobType;
import hrtech.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruiter/companies/{companyId}/jobs")
@RequiredArgsConstructor
@PreAuthorize("@companySecurity.isRecruiter(#companyId)")
public class RecruiterJobController {

    private final IJobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getManageCompanyJobs(
            @PathVariable UUID companyId,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) ExperienceLevel jobLevel,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getManageCompanyJobs(companyId, status, jobType, jobLevel, pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @PathVariable UUID companyId,
            @Valid @RequestBody JobRequest request
    ) {
        // Enforce company context match
        if (!companyId.equals(request.companyId())) {
            throw new IllegalArgumentException("Company context mismatch");
        }
        JobResponse response = jobService.createJob(request);
        return ResponseEntity
                .created(URI.create("/api/jobs/" + response.id()))
                .body(ApiResponse.success(response));
    }

    @PutMapping("/{jobId}")
    @PreAuthorize("@jobSecurity.isJobCreatorOrManager(#jobId)")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable UUID companyId,
            @PathVariable UUID jobId,
            @Valid @RequestBody JobRequest request
    ) {
        // Enforce company context match
        if (!companyId.equals(request.companyId())) {
            throw new IllegalArgumentException("Company context mismatch");
        }
        return ResponseEntity.ok(ApiResponse.success(jobService.updateJob(jobId, request)));
    }

    @PutMapping("/{jobId}/{action}")
    @PreAuthorize("@jobSecurity.canPerformAction(#jobId, #action)")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable UUID companyId,
            @PathVariable UUID jobId,
            @PathVariable String action
    ) {
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
}
