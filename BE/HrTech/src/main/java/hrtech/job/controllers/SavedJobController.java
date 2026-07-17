package hrtech.job.controllers;

import hrtech.job.entities.SavedJob;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.job.abstractions.services.ISavedJobService;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.RecentActivityResponse;
import hrtech.identity.utils.AuthUtils;
import hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final ISavedJobService savedJobService;
    private final AuthUtils authUtils;

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

    @GetMapping("/dashboard/count")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Long>> getSavedJobCountForDashboard() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(savedJobService.countSavedJobsByUserId(currentUserId)));
    }

    @GetMapping("/dashboard/recent-activities")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<RecentActivityResponse>>> getRecentActivitiesForDashboard(
            @RequestParam(defaultValue = "5") int limit) {
        UUID currentUserId = authUtils.getCurrentUserId();
        List<SavedJob> recentSavedJobs = savedJobService.getRecentSavedJobs(currentUserId, limit);

        List<RecentActivityResponse> activities = recentSavedJobs.stream().map(savedJob -> {
            String jobTitle = savedJob.getJob() != null ? savedJob.getJob().getTitle() : "Việc làm";
            String companyName = (savedJob.getJob() != null && savedJob.getJob().getCompany() != null)
                    ? savedJob.getJob().getCompany().getName()
                    : "Nhà tuyển dụng";
            return RecentActivityResponse.builder()
                    .action("Lưu việc làm: " + jobTitle + " tại " + companyName)
                    .date(savedJob.getCreatedAt())
                    .status("saved")
                    .build();
        }).toList();

        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
