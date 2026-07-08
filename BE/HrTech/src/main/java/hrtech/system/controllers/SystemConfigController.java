package hrtech.system.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.shared.response.ApiResponse;
import hrtech.system.abstractions.services.SystemConfigService;
import hrtech.system.dtos.PublicSystemConfigResponse;
import hrtech.system.dtos.SystemConfigRequest;
import hrtech.system.dtos.SystemConfigResponse;

@RestController
@RequestMapping("/api/system/configs")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping("/public")
    public ApiResponse<PublicSystemConfigResponse> getPublicSystemConfig() {
        return ApiResponse.success(
                systemConfigService.getPublicSystemConfig(),
                "Public system configuration retrieved successfully");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ApiResponse<SystemConfigResponse> getSystemConfig() {
        return ApiResponse.success(
                systemConfigService.getSystemConfig(),
                "System configuration retrieved successfully");
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ApiResponse<SystemConfigResponse> updateSystemConfig(
            @Valid @RequestBody SystemConfigRequest request) {
        return ApiResponse.success(
                systemConfigService.updateSystemConfig(request),
                "System configuration updated successfully");
    }
}
