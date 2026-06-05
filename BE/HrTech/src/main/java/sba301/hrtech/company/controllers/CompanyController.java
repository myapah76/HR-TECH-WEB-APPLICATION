package sba301.hrtech.company.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.shared.common.ApiResponse;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final ICompanyService companyService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<CompanyResponse>> registerCompany(
            @Valid @RequestPart("request") CompanyRegisterRequest request,
            @RequestPart("file") MultipartFile businessLicenseFile
    ) {
        CompanyResponse response = companyService.registerCompany(request, businessLicenseFile);
        return ResponseEntity
                .created(URI.create("/api/companies/" + response.id()))
                .body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.updateCompany(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable UUID id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<CompanyMemberResponse>> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddMemberRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(companyService.addMember(id, request)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<CompanyMemberResponse>>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getMembers(id)));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId
    ) {
        companyService.removeMember(id, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
