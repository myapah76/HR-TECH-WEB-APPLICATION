package hrtech.company.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.company.dtos.request.CompanyRegisterRequest;
import hrtech.company.dtos.request.CompanyUpdateRequest;
import hrtech.company.dtos.response.CompanyResponse;
import hrtech.company.dtos.response.TopCompanyResponse;
import hrtech.identity.dtos.auth.response.EmailActionResponse;

import hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final ICompanyService companyService;

    // ─── Registration ────────────────────────────────────────────────────────────

    @PostMapping(value = "/register")
    public ResponseEntity<ApiResponse<EmailActionResponse>> registerCompany(
            @Valid @RequestBody CompanyRegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyService.registerCompany(request)));
    }

    // ─── Landing ─────────────────────────────────────────────────────────────────

    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<TopCompanyResponse>>> getTopCompanies(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getTopCompanies(limit)));
    }

    // ─── CRUD ────────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getCompanies(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanies(keyword, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(id)));
    }

    @GetMapping("/my-company")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CompanyResponse>> getMyCompany() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getMyCompany()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@companySecurity.isOwner(#id)")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyService.updateCompany(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@companySecurity.isOwner(#id) or hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Admin Management ────────────────────────────────────────────────────────

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getCompaniesForAdmin(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompaniesForAdmin(keyword, pageable)));
    }

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<CompanyResponse>> approveCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.approveCompany(id)));
    }

    @PutMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<CompanyResponse>> rejectCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.rejectCompany(id)));
    }

    @PutMapping("/admin/{id}/restore")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<CompanyResponse>> restoreCompany(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.restoreCompany(id)));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> deleteCompanyForAdmin(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
