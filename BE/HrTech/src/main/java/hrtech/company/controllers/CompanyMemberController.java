package hrtech.company.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import hrtech.company.abstractions.services.ICompanyMemberService;
import hrtech.company.dtos.request.AddMemberRequest;
import hrtech.company.dtos.request.UpdateMemberRoleRequest;
import hrtech.company.dtos.response.CompanyMemberResponse;
import hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyMemberController {

    private final ICompanyMemberService companyMemberService;

    @PostMapping("/{id}/members")
    @PreAuthorize("@companySecurity.isOwnerOrManager(#id)")
    public ResponseEntity<ApiResponse<CompanyMemberResponse>> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyMemberService.addMember(id, request)));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("@companySecurity.isRecruiter(#id)")
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
        companyMemberService.transferOwnership(companyId, targetMemberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
