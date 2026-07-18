package hrtech.identity.controllers;

import hrtech.identity.abstractions.services.IAdminDashboardService;
import hrtech.identity.dtos.user.response.AdminDashboardSummaryResponse;
import hrtech.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final IAdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> getAdminDashboardSummary() {
        AdminDashboardSummaryResponse response = adminDashboardService.getAdminDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
