package hrtech.company.abstractions.services;

import hrtech.company.dtos.request.AddMemberRequest;
import hrtech.company.dtos.request.UpdateMemberRoleRequest;
import hrtech.company.dtos.response.CompanyMemberResponse;

import hrtech.company.entities.enums.CompanyPermission;

import java.util.List;
import java.util.UUID;

public interface ICompanyMemberService {

    CompanyMemberResponse addMember(UUID companyId, AddMemberRequest request);

    List<CompanyMemberResponse> getMembers(UUID companyId);

    void removeMember(UUID companyId, UUID memberId);

    void reactivateMember(UUID companyId, UUID memberId, boolean resetPassword);

    void updateMemberRole(UUID companyId, UUID memberId, UpdateMemberRoleRequest request);

    void transferOwnership(UUID companyId, UUID targetMemberId);

    boolean hasPermission(UUID userId, UUID companyId, CompanyPermission permission);
}
