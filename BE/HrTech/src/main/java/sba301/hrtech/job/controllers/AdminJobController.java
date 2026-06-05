package sba301.hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.shared.common.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_SYSTEM')")
public class AdminJobController {

    private final IJobService jobService;

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> adminDeleteJob(@PathVariable UUID id) {
        jobService.adminDeleteJob(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
