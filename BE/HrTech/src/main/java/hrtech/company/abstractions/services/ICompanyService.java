package hrtech.company.abstractions.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import hrtech.company.dtos.request.CompanyRegisterRequest;
import hrtech.company.dtos.request.CompanyUpdateRequest;
import hrtech.company.dtos.response.CompanyResponse;
import hrtech.company.dtos.response.TopCompanyResponse;
import hrtech.company.entities.Company;
import hrtech.company.entities.CompanyMember;
import hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import hrtech.identity.dtos.auth.response.EmailActionResponse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ICompanyService {

    // Landing / Top Employers
    List<TopCompanyResponse> getTopCompanies(int limit);

    // Registration
    EmailActionResponse registerCompany(CompanyRegisterRequest request);

    ConfirmOtpResult confirmRegisterOtp(String email);

    // CRUD
    Page<CompanyResponse> getCompanies(String keyword, Pageable pageable);

    Page<CompanyResponse> getCompaniesForAdmin(String keyword, Pageable pageable);

    CompanyResponse getCompanyById(UUID companyId);

    CompanyResponse getMyCompany();

    CompanyResponse updateCompany(UUID companyId, CompanyUpdateRequest request);

    void deleteCompany(UUID companyId);

    // Admin Approval
    CompanyResponse approveCompany(UUID companyId);

    CompanyResponse rejectCompany(UUID companyId);

    CompanyResponse restoreCompany(UUID companyId);

    // Internal
    Company getCompanyEntityById(UUID companyId);

    CompanyMember getMemberEntityByUserId(UUID userId);

    Optional<CompanyMember> getMemberByCompanyIdAndUserId(UUID companyId, UUID userId);

    void updateCompanyBalances(UUID companyId, int aiCreditDelta, int jobPostDelta);

    long countApprovedCompanies();
}
