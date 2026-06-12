package sba301.hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.job.abstractions.services.ISavedJobService;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.shared.common.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final ISavedJobService savedJobService;

    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> saveJob(@PathVariable UUID jobId) {
        savedJobService.saveJob(jobId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(@PathVariable UUID jobId) {
        savedJobService.unsaveJob(jobId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getSavedJobs(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(savedJobService.getSavedJobs(pageable)));
    }
}
