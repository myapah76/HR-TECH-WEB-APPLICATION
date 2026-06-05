package sba301.hrtech.company.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.shared.common.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_SYSTEM')")
public class AdminCompanyController {

    private final ICompanyService companyService;

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<CompanyResponse>> approveCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.approveCompany(id)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<CompanyResponse>> rejectCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.rejectCompany(id)));
    }
}

