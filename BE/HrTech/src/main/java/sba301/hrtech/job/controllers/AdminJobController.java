package sba301.hrtech.job.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.job.abstractions.services.IJobService;

import java.util.UUID;

/**
 * System Admin moderation endpoints.
 * Only ADMIN_SYSTEM role may access these endpoints.
 */
@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_SYSTEM')")
public class AdminJobController {

    private final IJobService jobService;

    /**
     * Force soft-delete any job to remove spam or policy-violating JDs.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> adminDeleteJob(@PathVariable UUID id) {
        jobService.adminDeleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
