package sba301.hrtech.application.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.application.abstractions.services.ApplicationService;
import sba301.hrtech.application.dtos.request.SubmitApplicationRequest;
import sba301.hrtech.application.dtos.response.ApplicationDetailResponse;
import sba301.hrtech.application.dtos.response.ApplicationSummaryResponse;
import sba301.hrtech.application.entities.enums.ApplicationStatus;
import sba301.hrtech.auth.utils.AuthUtils;
import sba301.hrtech.shared.common.ApiResponse;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AuthUtils authUtils;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationSummaryResponse>> submitApplication(
            @Valid @RequestBody SubmitApplicationRequest request) {
        UUID currentUserId = authUtils.getCurrentUserId();
        ApplicationSummaryResponse response = applicationService.submitApplication(currentUserId, request);
        return ResponseEntity
                .created(URI.create("/api/applications/" + response.getId()))
                .body(ApiResponse.success(response, "Ứng tuyển thành công"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<ApplicationSummaryResponse>>> getMyApplications() {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getMyApplications(currentUserId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplicationDetail(
            @PathVariable UUID id) {
        UUID currentUserId = authUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationDetail(currentUserId, id)));
    }

    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(@PathVariable UUID id) {
        UUID currentUserId = authUtils.getCurrentUserId();
        applicationService.withdrawApplication(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Rút hồ sơ thành công"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HR', 'HR_MANAGER', 'EMPLOYER')")
    public ResponseEntity<ApiResponse<ApplicationSummaryResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.updateStatus(id, status)));
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('HR', 'HR_MANAGER', 'EMPLOYER')")
    public ResponseEntity<ApiResponse<List<ApplicationSummaryResponse>>> getApplicationsByJob(
            @PathVariable UUID jobId) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplicationsByJob(jobId)));
    }
}
