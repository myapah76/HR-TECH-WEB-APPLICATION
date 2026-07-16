package hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.abstractions.services.IJobService;
import hrtech.shared.response.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_SYSTEM')")
public class AdminJobController {

    private final IJobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getJobReport(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobReport(keyword, pageable)));
    }

    @PutMapping("/{id}/approve-appeal")
    public ResponseEntity<ApiResponse<JobResponse>> approveAppeal(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.approveAppeal(id)));
    }

    @PutMapping("/{id}/reject-appeal")
    public ResponseEntity<ApiResponse<JobResponse>> rejectAppeal(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.rejectAppeal(id)));
    }
}
