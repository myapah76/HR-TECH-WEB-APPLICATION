package sba301.hrtech.company.abstractions.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;

import java.util.List;
import java.util.UUID;

public interface ICompanyService {

    // Registration
    EmailActionResponse registerCompany(CompanyRegisterRequest request);

    ConfirmOtpResult confirmRegisterOtp(String email);

    // CRUD
    Page<CompanyResponse> getCompanies(String keyword, Pageable pageable);

    CompanyResponse getCompanyById(UUID companyId);

    CompanyResponse getMyCompany();

    CompanyResponse updateCompany(UUID companyId, CompanyUpdateRequest request);

    void deleteCompany(UUID companyId);

    // Member Management
    CompanyMemberResponse addMember(UUID companyId, AddMemberRequest request);

    List<CompanyMemberResponse> getMembers(UUID companyId);

    void removeMember(UUID companyId, UUID memberId);

    void transferOwnership(UUID companyId, UUID currentOwnerId, UUID targetMemberId);

    // Admin Approval
    CompanyResponse approveCompany(UUID companyId);

    CompanyResponse rejectCompany(UUID companyId);
}

