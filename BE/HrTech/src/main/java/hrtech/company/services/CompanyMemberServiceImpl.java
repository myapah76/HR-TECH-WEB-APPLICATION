package hrtech.company.services;

import hrtech.company.entities.enums.CompanyStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.company.abstractions.repositories.CompanyMemberRepository;
import hrtech.company.abstractions.repositories.CompanyRepository;
import hrtech.company.abstractions.services.ICompanyMemberService;
import hrtech.company.dtos.request.AddMemberRequest;
import hrtech.company.dtos.request.UpdateMemberRoleRequest;
import hrtech.company.dtos.response.CompanyMemberResponse;
import hrtech.company.entities.Company;
import hrtech.company.entities.CompanyMember;
import hrtech.company.entities.enums.CompanyPermission;
import hrtech.company.entities.enums.CompanyRole;
import hrtech.company.entities.enums.MembershipStatus;
import hrtech.company.mapper.CompanyMapper;
import hrtech.identity.abstractions.services.IRoleService;
import hrtech.identity.abstractions.services.IUserService;
import hrtech.identity.entities.Role;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.notification.abstractions.services.IEmailSender;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.Set;
import java.util.EnumMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CompanyMemberServiceImpl implements ICompanyMemberService {

    private final IUserService userService;
    private final IRoleService roleService;

    private final CompanyMemberRepository companyMemberRepository;
    private final CompanyRepository companyRepository;

    private final CompanyMapper companyMapper;
    private final PasswordEncoder passwordEncoder;
    private final IEmailSender emailSender;
    private final AuthUtils authUtils;

    private static final Map<CompanyRole, Set<CompanyPermission>> ROLE_PERMISSIONS_MAPPING = new EnumMap<>(CompanyRole.class);

    static {
        ROLE_PERMISSIONS_MAPPING.put(CompanyRole.OWNER, Set.of(
            CompanyPermission.MANAGE_MEMBERS,
            CompanyPermission.VIEW_APPLICANTS,
            CompanyPermission.UPDATE_COMPANY_PROFILE,
            CompanyPermission.APPROVE_JOB
        ));
        
        ROLE_PERMISSIONS_MAPPING.put(CompanyRole.HR_MANAGER, Set.of(
            CompanyPermission.CREATE_JOB,
            CompanyPermission.UPDATE_JOB,
            CompanyPermission.DELETE_JOB,
            CompanyPermission.VIEW_APPLICANTS,
            CompanyPermission.UPDATE_APPLICATION_STATUS,
            CompanyPermission.APPROVE_JOB
        ));
        
        ROLE_PERMISSIONS_MAPPING.put(CompanyRole.HR, Set.of(
            CompanyPermission.CREATE_JOB,
            CompanyPermission.UPDATE_JOB,
            CompanyPermission.VIEW_APPLICANTS
        ));
    }

    private boolean requiresApprovedCompany(CompanyPermission permission) {
        return permission == CompanyPermission.CREATE_JOB
            || permission == CompanyPermission.UPDATE_JOB
            || permission == CompanyPermission.DELETE_JOB
            || permission == CompanyPermission.VIEW_APPLICANTS
            || permission == CompanyPermission.UPDATE_APPLICATION_STATUS
            || permission == CompanyPermission.APPROVE_JOB
            || permission == CompanyPermission.UPDATE_COMPANY_PROFILE;
    }

    private void validateOwner(UUID companyId, UUID userId) {
        CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN, "You are not a member of this company."));
        if (member.getMembershipStatus() != MembershipStatus.ACTIVE || member.getCompanyRole() != CompanyRole.OWNER) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only company OWNER can perform this action.");
        }
    }

    @Override
    @Transactional
    public CompanyMemberResponse addMember(UUID companyId, AddMemberRequest request) {
        User currentUser = authUtils.getCurrentUser();

        if (!hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        String email = request.email().toLowerCase();
        if (userService.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED,
                    "Email is already registered. Please provide a new corporate email.");
        }

        String requestedRole = request.role();
        if ("OWNER".equalsIgnoreCase(requestedRole)) {
            throw new AppException(ErrorCode.CANNOT_ASSIGN_OWNER, "Cannot assign OWNER role via member management.");
        }

        CompanyRole companyRole;
        try {
            companyRole = CompanyRole.valueOf(requestedRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ROLE, "Invalid company role. Must be HR or HR_MANAGER.");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));

        Role recruiterRole = roleService.getRoleEntityByName("RECRUITER");
        String randomPassword = UUID.randomUUID().toString().substring(0, 8);

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(email);
        newUser.setPassword(passwordEncoder.encode(randomPassword));

        String fullName = request.fullName();
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            if (parts.length > 1) {
                newUser.setLastName(parts[0]);
                newUser.setFirstName(parts[1]);
            } else {
                newUser.setFirstName(parts[0]);
                newUser.setLastName("");
            }
        }

        newUser.setRole(recruiterRole);
        newUser.setRequirePasswordChange(true);
        newUser.setIsBlocked(false);

        User savedUser = userService.saveUserEntity(newUser);

        CompanyMember companyMember = CompanyMember.builder()
                .company(company)
                .user(savedUser)
                .companyRole(companyRole)
                .joinedAt(Instant.now())
                .membershipStatus(MembershipStatus.ACTIVE)
                .build();
        CompanyMember savedMember = companyMemberRepository.save(companyMember);

        emailSender.sendWelcomeEmailAsync(email, request.fullName(), randomPassword, company.getName());

        return companyMapper.toMemberResponse(savedMember);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyMemberResponse> getMembers(UUID companyId) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found.");
        }

        return companyMemberRepository.findByCompanyIdAndDeletedFalse(companyId)
                .stream()
                .map(companyMapper::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeMember(UUID companyId, UUID memberId) {
        User currentUser = authUtils.getCurrentUser();

        if (!hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        CompanyMember targetMember = companyMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND, "Member not found."));

        if (!targetMember.getCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.INVALID_MEMBER_ASSOCIATION, "User does not belong to this company.");
        }

        if (targetMember.getCompanyRole() == CompanyRole.OWNER) {
            List<CompanyMember> owners = companyMemberRepository
                    .findAllByCompanyIdAndCompanyRoleAndDeletedFalse(companyId, CompanyRole.OWNER);
            if (owners.size() <= 1) {
                throw new AppException(ErrorCode.CANNOT_REMOVE_OWNER,
                        "Company OWNER cannot be removed. Transfer ownership first.");
            }
        }

        targetMember.setMembershipStatus(MembershipStatus.INACTIVE);
        companyMemberRepository.save(targetMember);

        User targetUser = targetMember.getUser();
        targetUser.setIsBlocked(true);
        userService.saveUserEntity(targetUser);
    }

    @Override
    @Transactional
    public void reactivateMember(UUID companyId, UUID memberId, boolean resetPassword) {
        User currentUser = authUtils.getCurrentUser();

        if (!hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        CompanyMember targetMember = companyMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND, "Member not found."));

        if (!targetMember.getCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.INVALID_MEMBER_ASSOCIATION, "User does not belong to this company.");
        }

        targetMember.setMembershipStatus(MembershipStatus.ACTIVE);
        companyMemberRepository.save(targetMember);

        User targetUser = targetMember.getUser();
        targetUser.setIsBlocked(false);

        if (resetPassword) {
            String randomPassword = UUID.randomUUID().toString().substring(0, 8);
            targetUser.setPassword(passwordEncoder.encode(randomPassword));
            targetUser.setRequirePasswordChange(true);

            String fullName = (targetUser.getLastName() + " " + targetUser.getFirstName()).trim();
            if (fullName.isEmpty()) {
                fullName = "Thành viên";
            }
            emailSender.sendWelcomeEmailAsync(
                    targetUser.getEmail(),
                    fullName,
                    randomPassword,
                    targetMember.getCompany().getName());
        }

        userService.saveUserEntity(targetUser);
    }

    @Override
    @Transactional
    public void updateMemberRole(UUID companyId, UUID memberId, UpdateMemberRoleRequest request) {
        User currentUser = authUtils.getCurrentUser();

        if (!hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        CompanyMember targetMember = companyMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND, "Member not found."));

        if (!targetMember.getCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.INVALID_MEMBER_ASSOCIATION, "User does not belong to this company.");
        }

        if (targetMember.getCompanyRole() == CompanyRole.OWNER) {
            throw new AppException(ErrorCode.CANNOT_ASSIGN_OWNER,
                    "Cannot change OWNER role. Use transfer ownership instead.");
        }

        String requestedRole = request.role();
        if ("OWNER".equalsIgnoreCase(requestedRole)) {
            throw new AppException(ErrorCode.CANNOT_ASSIGN_OWNER, "Cannot assign OWNER role via member management.");
        }

        CompanyRole newRole;
        try {
            newRole = CompanyRole.valueOf(requestedRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_ROLE, "Invalid company role. Must be HR or HR_MANAGER.");
        }

        targetMember.setCompanyRole(newRole);
        companyMemberRepository.save(targetMember);
    }

    @Override
    @Transactional
    public void transferOwnership(UUID companyId, UUID targetMemberId) {
        UUID currentOwnerId = authUtils.getCurrentUserId();
        validateOwner(companyId, currentOwnerId);

        CompanyMember oldOwnerMember = companyMemberRepository
                .findByCompanyIdAndUserIdAndDeletedFalse(companyId, currentOwnerId)
                .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_FOUND, "Current owner not found."));

        CompanyMember targetMember = companyMemberRepository.findById(targetMemberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND, "Target member not found."));

        if (!targetMember.getCompany().getId().equals(companyId)
                || targetMember.getMembershipStatus() != MembershipStatus.ACTIVE) {
            throw new AppException(ErrorCode.INVALID_TARGET_MEMBER,
                    "Target member must be an active member of the same company.");
        }

        oldOwnerMember.setCompanyRole(CompanyRole.HR_MANAGER);
        targetMember.setCompanyRole(CompanyRole.OWNER);

        companyMemberRepository.save(oldOwnerMember);
        companyMemberRepository.save(targetMember);

        List<CompanyMember> owners = companyMemberRepository.findAllByCompanyIdAndCompanyRoleAndDeletedFalse(companyId,
                CompanyRole.OWNER);
        if (owners.size() != 1) {
            throw new AppException(ErrorCode.INVALID_OWNER_COUNT,
                    "Ownership transfer resulted in an invalid number of owners.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(UUID userId, UUID companyId, CompanyPermission permission) {
        return companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .map(member -> {
                    if (member.getMembershipStatus() != MembershipStatus.ACTIVE) {
                        return false;
                    }
                    if (requiresApprovedCompany(permission)
                            && member.getCompany().getStatus() != CompanyStatus.APPROVED) {
                        return false;
                    }

                    Set<CompanyPermission> permissions = ROLE_PERMISSIONS_MAPPING.get(member.getCompanyRole());
                    return permissions != null && permissions.contains(permission);
                })
                .orElse(false);
    }
}
