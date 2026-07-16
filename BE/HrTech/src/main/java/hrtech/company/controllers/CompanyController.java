package hrtech.company.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import hrtech.identity.utils.AuthUtils;
import org.springframework.web.bind.annotation.*;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.company.abstractions.services.ICompanyMemberService;
import hrtech.company.abstractions.services.ICompanyDashboardService;
import hrtech.company.dtos.request.AddMemberRequest;
import hrtech.company.dtos.request.CompanyRegisterRequest;
import hrtech.company.dtos.request.CompanyUpdateRequest;
import hrtech.company.dtos.request.UpdateMemberRoleRequest;
import hrtech.company.dtos.response.CompanyMemberResponse;
import hrtech.company.dtos.response.CompanyResponse;
import hrtech.company.dtos.response.RecruiterActiveJobResponse;
import hrtech.company.dtos.response.RecruiterAnalyticsResponse;
import hrtech.company.dtos.response.RecruiterDashboardSummaryResponse;
import hrtech.company.dtos.response.RecruiterUpcomingInterviewResponse;
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
    private final ICompanyMemberService companyMemberService;
    private final ICompanyDashboardService companyDashboardService;
    private final AuthUtils authUtils;

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

    // ─── Member Management ───────────────────────────────────────────────────────

    @PostMapping("/{id}/members")
    @PreAuthorize("@companySecurity.isOwnerOrManager(#id)")
    public ResponseEntity<ApiResponse<CompanyMemberResponse>> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyMemberService.addMember(id, request)));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("@companySecurity.isMember(#id)")
    public ResponseEntity<ApiResponse<List<CompanyMemberResponse>>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyMemberService.getMembers(id)));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("@companySecurity.isOwnerOrManager(#id)")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId) {
        companyMemberService.removeMember(id, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/members/{memberId}/role")
    @PreAuthorize("@companySecurity.isOwner(#id)")
    public ResponseEntity<ApiResponse<Void>> updateMemberRole(
            @PathVariable UUID id,
            @PathVariable UUID memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        companyMemberService.updateMemberRole(id, memberId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/members/{memberId}/reactivate")
    @PreAuthorize("@companySecurity.isOwner(#id)")
    public ResponseEntity<ApiResponse<Void>> reactivateMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId,
            @RequestParam(defaultValue = "false") boolean resetPassword) {
        companyMemberService.reactivateMember(id, memberId, resetPassword);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/transfer-ownership")
    @PreAuthorize("@companySecurity.isOwner(#id)")
    public ResponseEntity<ApiResponse<Void>> transferOwnership(
            @PathVariable("id") UUID companyId,
            @RequestParam("targetMemberId") UUID targetMemberId) {
        UUID currentUserId = authUtils.getCurrentUserId();
        companyMemberService.transferOwnership(companyId, currentUserId, targetMemberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Dashboard ───────────────────────────────────────────────────────────────

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterDashboardSummaryResponse>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(companyDashboardService.getRecruiterDashboardSummary()));
    }

    @GetMapping("/dashboard/upcoming-interviews")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<RecruiterUpcomingInterviewResponse>>> getDashboardUpcomingInterviews() {
        return ResponseEntity.ok(ApiResponse.success(companyDashboardService.getRecruiterUpcomingInterviews()));
    }

    @GetMapping("/dashboard/active-jobs")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<RecruiterActiveJobResponse>>> getDashboardActiveJobs() {
        return ResponseEntity.ok(ApiResponse.success(companyDashboardService.getRecruiterActiveJobs()));
    }

    @GetMapping("/dashboard/analytics")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<RecruiterAnalyticsResponse>> getDashboardAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(companyDashboardService.getRecruiterAnalytics()));
    }
}
