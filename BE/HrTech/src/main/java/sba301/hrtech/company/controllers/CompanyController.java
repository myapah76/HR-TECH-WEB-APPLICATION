package sba301.hrtech.company.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.shared.response.ApiResponse;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final ICompanyService companyService;

    @PostMapping(value = "/register")
    public ResponseEntity<ApiResponse<EmailActionResponse>> registerCompany(
            @Valid @RequestBody CompanyRegisterRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.registerCompany(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getCompanies(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
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
            @Valid @RequestBody CompanyUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.updateCompany(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@companySecurity.isOwner(#id) or hasRole('ADMIN_SYSTEM')")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("@companySecurity.isOwnerOrManager(#id)")
    public ResponseEntity<ApiResponse<CompanyMemberResponse>> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddMemberRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.addMember(id, request)));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("@companySecurity.isMember(#id)")
    public ResponseEntity<ApiResponse<List<CompanyMemberResponse>>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getMembers(id)));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("@companySecurity.isOwnerOrManager(#id)")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId
    ) {
        companyService.removeMember(id, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/transfer-ownership")
    @PreAuthorize("@companySecurity.isOwner(#id)")
    public ResponseEntity<ApiResponse<Void>> transferOwnership(
            @PathVariable("id") UUID companyId,
            @RequestParam("targetMemberId") UUID targetMemberId
    ) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            UUID currentUserId = userDetails.user().getId();
            companyService.transferOwnership(companyId, currentUserId, targetMemberId);
            return ResponseEntity.ok(ApiResponse.success(null));
        }
        return ResponseEntity.status(401).build();
    }
}
