package sba301.hrtech.company.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.abstractions.repositories.CompanyMemberRepository;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyPermission;
import sba301.hrtech.company.entities.enums.CompanyRole;
import sba301.hrtech.company.entities.enums.CompanySize;
import sba301.hrtech.company.entities.enums.CompanyStatus;
import sba301.hrtech.company.entities.enums.MembershipStatus;
import sba301.hrtech.company.mapper.CompanyMapper;
import sba301.hrtech.identity.abstractions.repositories.RoleRepository;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.entities.Role;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.shared.exceptions.AppException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements ICompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TaxVerificationService taxVerificationService;
    private final CompanyMapper companyMapper;
    private final CompanyMemberRepository companyMemberRepository;
    private final CompanyPermissionService companyPermissionService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.user();
        }
        throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User is not authenticated");
    }

    private void validateOwner(UUID companyId, UUID userId) {
        CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not a member of this company."));
        if (member.getMembershipStatus() != MembershipStatus.ACTIVE || member.getCompanyRole() != CompanyRole.OWNER) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only company OWNER can perform this action.");
        }
    }

    @Override
    @Transactional
    public CompanyResponse registerCompany(CompanyRegisterRequest request) {
        User currentUser = getCurrentUser();

        // 1. Verify user does not already belong to a company (Option A constraint)
        if (companyMemberRepository.existsByUserIdAndDeletedFalse(currentUser.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "ALREADY_OWNS_COMPANY", "Each user can only register or belong to one company.");
        }

        String taxCode = request.taxCode();

        // 2. Check duplicate tax code
        Optional<Company> existingCompanyOpt = companyRepository.findByTaxCode(taxCode);
        Company savedCompany;
        if (existingCompanyOpt.isPresent()) {
            Company existingCompany = existingCompanyOpt.get();
            if (!existingCompany.isDeleted()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "DUPLICATE_TAX_CODE", "This tax code is already registered.");
            }
            // Re-activate and update company info
            existingCompany.setDeleted(false);
            existingCompany.setName(request.name());
            existingCompany.setDescription(request.description());
            existingCompany.setWebsite(request.website());
            existingCompany.setIndustry(request.industry());
            existingCompany.setAddress(request.address());
            if (request.size() != null) {
                try {
                    existingCompany.setSize(CompanySize.valueOf(request.size()));
                } catch (IllegalArgumentException e) {
                    existingCompany.setSize(CompanySize.SME);
                }
            }
            existingCompany.setStatus(CompanyStatus.PENDING);
            
            savedCompany = companyRepository.save(existingCompany);
        } else {
            // 3. Verify with VietQR API
            taxVerificationService.verifyTaxCode(taxCode);

            // 4. Create Company
            Company company = companyMapper.fromRegisterRequest(request);
            company.setTaxCode(taxCode);
            company.setStatus(CompanyStatus.PENDING);
            if (request.size() != null) {
                try {
                    company.setSize(CompanySize.valueOf(request.size()));
                } catch (IllegalArgumentException e) {
                    company.setSize(CompanySize.SME);
                }
            }
            savedCompany = companyRepository.save(company);
        }

        // 5. Update global role of owner to RECRUITER if it isn't already
        Role recruiterRole = roleRepository.findByName("RECRUITER")
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "RECRUITER role not found."));
        currentUser.setRole(recruiterRole);
        userRepository.save(currentUser);

        // 6. Create CompanyMember record as OWNER immediately
        CompanyMember ownerMember = CompanyMember.builder()
                .company(savedCompany)
                .user(currentUser)
                .companyRole(CompanyRole.OWNER)
                .joinedAt(LocalDateTime.now())
                .membershipStatus(MembershipStatus.ACTIVE)
                .build();
        companyMemberRepository.save(ownerMember);

        return companyMapper.toResponse(savedCompany);
    }

    @Override
    public CompanyResponse getCompanyById(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }
        return companyMapper.toResponse(company);
    }

    @Override
    @Transactional
    public CompanyResponse updateCompany(UUID companyId, CompanyUpdateRequest request) {
        User currentUser = getCurrentUser();

        // Use Permission service check
        if (!companyPermissionService.hasPermission(currentUser.getId(), companyId, CompanyPermission.UPDATE_COMPANY_PROFILE)) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access Denied");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        companyMapper.updateCompanyFromDto(request, company);
        if (request.size() != null) {
            try {
                company.setSize(CompanySize.valueOf(request.size()));
            } catch (IllegalArgumentException ignored) {}
        }

        Company updatedCompany = companyRepository.save(company);
        return companyMapper.toResponse(updatedCompany);
    }

    @Override
    @Transactional
    public void deleteCompany(UUID companyId) {
        User currentUser = getCurrentUser();
        
        boolean isAdmin = currentUser.getRole() != null && "ADMIN_SYSTEM".equals(currentUser.getRole().getName());
        if (!isAdmin) {
            validateOwner(companyId, currentUser.getId());
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        company.setDeleted(true);
        companyRepository.save(company);

        // Disassociate and soft delete all members
        List<CompanyMember> members = companyMemberRepository.findByCompanyIdAndDeletedFalse(companyId);
        Role candidateRole = roleRepository.findByName("CANDIDATE").orElse(null);
        for (CompanyMember member : members) {
            member.setMembershipStatus(MembershipStatus.REMOVED);
            member.setDeleted(true);
            companyMemberRepository.save(member);

            // Revert global role to CANDIDATE
            User user = member.getUser();
            if (candidateRole != null) {
                user.setRole(candidateRole);
                userRepository.save(user);
            }
        }
    }

    @Override
    @Transactional
    public CompanyMemberResponse addMember(UUID companyId, AddMemberRequest request) {
        User currentUser = getCurrentUser();

        if (!companyPermissionService.hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access Denied");
        }

        UUID targetUserId = UUID.fromString(request.userId());
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Target user not found."));

        if (companyMemberRepository.existsByUserIdAndDeletedFalse(targetUserId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "ALREADY_MEMBER", "User is already a member of a company.");
        }

        String requestedRole = request.role();
        if ("OWNER".equalsIgnoreCase(requestedRole)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_ASSIGN_OWNER", "Cannot assign OWNER role via member management.");
        }

        CompanyRole companyRole;
        try {
            companyRole = CompanyRole.valueOf(requestedRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Invalid company role. Must be HR or HR_MANAGER.");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));

        // Update target user's system role to RECRUITER
        Role recruiterRole = roleRepository.findByName("RECRUITER")
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "RECRUITER role not found."));
        targetUser.setRole(recruiterRole);
        userRepository.save(targetUser);

        CompanyMember companyMember = CompanyMember.builder()
                .company(company)
                .user(targetUser)
                .companyRole(companyRole)
                .joinedAt(LocalDateTime.now())
                .membershipStatus(MembershipStatus.ACTIVE)
                .build();
        CompanyMember savedMember = companyMemberRepository.save(companyMember);

        return companyMapper.toMemberResponse(savedMember);
    }

    @Override
    public List<CompanyMemberResponse> getMembers(UUID companyId) {
        getCurrentUser();

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
             throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        return companyMemberRepository.findByCompanyIdAndDeletedFalse(companyId)
                .stream()
                .map(companyMapper::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeMember(UUID companyId, UUID memberId) {
        User currentUser = getCurrentUser();

        if (!companyPermissionService.hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access Denied");
        }

        CompanyMember targetMember = companyMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "Member not found."));

        if (!targetMember.getCompany().getId().equals(companyId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_MEMBER_ASSOCIATION", "User does not belong to this company.");
        }

        if (targetMember.getCompanyRole() == CompanyRole.OWNER) {
            List<CompanyMember> owners = companyMemberRepository.findAllByCompanyIdAndCompanyRoleAndDeletedFalse(companyId, CompanyRole.OWNER);
            if (owners.size() <= 1) {
                throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_REMOVE_OWNER", "Company OWNER cannot be removed. Transfer ownership first.");
            }
        }

        targetMember.setMembershipStatus(MembershipStatus.REMOVED);
        targetMember.setDeleted(true);
        companyMemberRepository.save(targetMember);

        // Revert global role to CANDIDATE
        User targetUser = targetMember.getUser();
        Role candidateRole = roleRepository.findByName("CANDIDATE").orElse(null);
        if (candidateRole != null) {
            targetUser.setRole(candidateRole);
            userRepository.save(targetUser);
        }
    }

    @Override
    @Transactional
    public void transferOwnership(UUID companyId, UUID currentOwnerId, UUID targetMemberId) {
        validateOwner(companyId, currentOwnerId);

        CompanyMember oldOwnerMember = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, currentOwnerId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "OWNER_NOT_FOUND", "Current owner not found."));

        CompanyMember targetMember = companyMemberRepository.findById(targetMemberId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "Target member not found."));

        if (!targetMember.getCompany().getId().equals(companyId) || targetMember.getMembershipStatus() != MembershipStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_TARGET_MEMBER", "Target member must be an active member of the same company.");
        }

        // Transfer roles
        oldOwnerMember.setCompanyRole(CompanyRole.HR_MANAGER);
        targetMember.setCompanyRole(CompanyRole.OWNER);

        companyMemberRepository.save(oldOwnerMember);
        companyMemberRepository.save(targetMember);

        // Assert exactly 1 owner exists
        List<CompanyMember> owners = companyMemberRepository.findAllByCompanyIdAndCompanyRoleAndDeletedFalse(companyId, CompanyRole.OWNER);
        if (owners.size() != 1) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "INVALID_OWNER_COUNT", "Ownership transfer resulted in an invalid number of owners.");
        }
    }

    @Override
    @Transactional
    public CompanyResponse approveCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        company.setStatus(CompanyStatus.APPROVED);
        Company savedCompany = companyRepository.save(company);
        return companyMapper.toResponse(savedCompany);
    }

    @Override
    @Transactional
    public CompanyResponse rejectCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        company.setStatus(CompanyStatus.REJECTED);
        Company savedCompany = companyRepository.save(company);
        return companyMapper.toResponse(savedCompany);
    }
}
