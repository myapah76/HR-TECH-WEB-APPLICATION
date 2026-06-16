package sba301.hrtech.company.abstractions.services;

import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;

import java.util.List;
import java.util.UUID;

public interface ICompanyService {

    // Registration
    CompanyResponse registerCompany(CompanyRegisterRequest request);

    // CRUD
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

