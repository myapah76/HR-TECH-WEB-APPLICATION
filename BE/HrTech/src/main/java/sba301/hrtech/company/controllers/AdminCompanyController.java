package sba301.hrtech.company.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.shared.response.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_SYSTEM')")
public class AdminCompanyController {

    private final ICompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getCompaniesForAdmin(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompaniesForAdmin(keyword, pageable)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<CompanyResponse>> approveCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.approveCompany(id)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<CompanyResponse>> rejectCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.rejectCompany(id)));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<CompanyResponse>> restoreCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.restoreCompany(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

