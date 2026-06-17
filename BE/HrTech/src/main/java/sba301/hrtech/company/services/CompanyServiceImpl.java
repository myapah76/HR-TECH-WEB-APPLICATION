package sba301.hrtech.company.services;

import lombok.RequiredArgsConstructor;
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
import sba301.hrtech.identity.dtos.auth.response.ConfirmOtpResult;
import sba301.hrtech.identity.dtos.auth.response.EmailActionResponse;
import sba301.hrtech.identity.mapper.UserMapper;
import sba301.hrtech.notification.abstractions.INotificationService;
import sba301.hrtech.notification.dtos.OtpNotificationRequest;
import sba301.hrtech.notification.dtos.OtpRequest;
import sba301.hrtech.shared.enums.OtpType;
import sba301.hrtech.identity.services.cache.OtpAttemptTracker;
import org.springframework.data.redis.core.RedisTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.time.Duration;
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
import sba301.hrtech.notification.abstractions.IEmailSender;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final IEmailSender emailSender;
    private final INotificationService notificationService;
    private final OtpAttemptTracker otpAttemptTracker;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.user();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED, "User is not authenticated");
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
    public EmailActionResponse registerCompany(CompanyRegisterRequest request) {
        String email = request.email().toLowerCase();
        
        // 1. Check if email exists
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED, "Email is already registered. Please use a different email for business account.");
        }

        // 2. Check Tax Code
        String taxCode = request.taxCode();
        Optional<Company> existingCompanyOpt = companyRepository.findByTaxCode(taxCode);
        if (existingCompanyOpt.isPresent()) {
            Company existingCompany = existingCompanyOpt.get();
            if (!existingCompany.isDeleted()) {
                throw new AppException(ErrorCode.DUPLICATE_TAX_CODE, "This tax code is already registered.");
            } else {
                throw new AppException(ErrorCode.DUPLICATE_TAX_CODE, "This tax code is banned or deactivated. Please contact support.");
            }
        }

        // 3. Verify with VietQR API
        taxVerificationService.verifyTaxCode(taxCode);

        // 4. Generate OTP
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        String key = OtpType.REGISTER_COMPANY + email;

        // 5. Save to Redis
        try {
            if (redisTemplate.hasKey(key)) {
                redisTemplate.delete(key);
            }
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(request), Duration.ofMinutes(5));
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to save data to Redis: " + e.getMessage());
        }

        // 6. Send OTP Notification
        notificationService.OtpNotificationHandler(new OtpNotificationRequest(
                new OtpRequest(email, otp),
                email + otp,
                OtpType.REGISTER_COMPANY
        ));

        return EmailActionResponse.builder()
                .email(email)
                .expireIn(5 * 60)
                .build();
    }

    @Override
    @Transactional
    public ConfirmOtpResult confirmRegisterOtp(String email) {
        
        // 1. Retrieve payload from Redis
        String key = OtpType.REGISTER_COMPANY + email;
        String json = (String) redisTemplate.opsForValue().get(key);
        if (json == null) {
            throw new AppException(ErrorCode.REDIS_DATA_NOT_FOUND, "Redis data not found or expired for key: " + key);
        }

        CompanyRegisterRequest payload;
        try {
            payload = objectMapper.readValue(json, CompanyRegisterRequest.class);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Failed to parse Redis data: " + e.getMessage());
        }

        // Double check email existence just in case
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED, "Email is already registered.");
        }

        // 2. Create User (RECRUITER)
        Role recruiterRole = roleRepository.findByName("RECRUITER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND, "RECRUITER role not found."));
                
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(email);
        newUser.setPassword(passwordEncoder.encode(payload.password()));
        newUser.setPhone(payload.phone());
        
        String fullName = payload.fullName();
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            newUser.setFirstName(parts.length > 1 ? parts[1] : "");
            newUser.setLastName(parts[0]);
        }

        newUser.setRole(recruiterRole);
        newUser.setIsBlocked(false);
        User savedUser = userRepository.save(newUser);

        // 3. Create Company
        Company company = companyMapper.fromRegisterRequest(payload);
        company.setTaxCode(payload.taxCode());
        company.setStatus(CompanyStatus.PENDING);
        if (payload.size() != null) {
            try {
                company.setSize(CompanySize.valueOf(payload.size()));
            } catch (IllegalArgumentException e) {
                company.setSize(CompanySize.SME);
            }
        }
        Company savedCompany = companyRepository.save(company);

        // 4. Link User to Company as OWNER
        CompanyMember ownerMember = CompanyMember.builder()
                .company(savedCompany)
                .user(savedUser)
                .companyRole(CompanyRole.OWNER)
                .membershipStatus(MembershipStatus.ACTIVE)
                .build();
        companyMemberRepository.save(ownerMember);

        // 5. Cleanup Redis and Reset Attempts
        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);

        return new ConfirmOtpResult(
                OtpType.REGISTER_COMPANY.toString(),
                companyMapper.toResponse(savedCompany)
        );
    }

    @Override
    public CompanyResponse getCompanyById(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_BANNED, "Company has been deactivated or banned.");
        }
        return companyMapper.toResponse(company);
    }

    @Override
    public CompanyResponse getMyCompany() {
        User currentUser = getCurrentUser();
        Company company = companyRepository.findCompanyByUserIdIncludingDeleted(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "You are not a member of any company."));

        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_BANNED, "Company has been deactivated or banned.");
        }
        
        return companyMapper.toResponse(company);
    }

    @Override
    @Transactional
    public CompanyResponse updateCompany(UUID companyId, CompanyUpdateRequest request) {
        User currentUser = getCurrentUser();

        // Use Permission service check
        if (!companyPermissionService.hasPermission(currentUser.getId(), companyId, CompanyPermission.UPDATE_COMPANY_PROFILE)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found.");
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
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found.");
        }

        company.setDeleted(true);
        companyRepository.save(company);

        // Disassociate and soft delete all members
        List<CompanyMember> members = companyMemberRepository.findByCompanyIdAndDeletedFalse(companyId);
        for (CompanyMember member : members) {
            member.setMembershipStatus(MembershipStatus.REMOVED);
            member.setDeleted(true);
            companyMemberRepository.save(member);
            
            // Block non-owner accounts so they cannot login
            if (member.getCompanyRole() != CompanyRole.OWNER) {
                User user = member.getUser();
                user.setIsBlocked(true);
                userRepository.save(user);
            }
        }
    }

    @Override
    @Transactional
    public CompanyMemberResponse addMember(UUID companyId, AddMemberRequest request) {
        User currentUser = getCurrentUser();

        if (!companyPermissionService.hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        String email = request.email().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED, "Email is already registered. Please provide a new corporate email.");
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

        Role recruiterRole = roleRepository.findByName("RECRUITER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND, "RECRUITER role not found."));

        // Generate a random password (e.g. 8 chars alphanumeric)
        String randomPassword = java.util.UUID.randomUUID().toString().substring(0, 8);

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(email);
        newUser.setPassword(passwordEncoder.encode(randomPassword));
        
        // Extract firstName and lastName from fullName if needed
        String fullName = request.fullName();
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            newUser.setFirstName(parts.length > 1 ? parts[1] : "");
            newUser.setLastName(parts[0]);
        }
        
        newUser.setRole(recruiterRole);
        newUser.setRequirePasswordChange(true);
        newUser.setIsBlocked(false);

        User savedUser = userRepository.save(newUser);

        CompanyMember companyMember = CompanyMember.builder()
                .company(company)
                .user(savedUser)
                .companyRole(companyRole)
                .joinedAt(LocalDateTime.now())
                .membershipStatus(MembershipStatus.ACTIVE)
                .build();
        CompanyMember savedMember = companyMemberRepository.save(companyMember);

        // Send welcome email asynchronously
        emailSender.sendWelcomeEmailAsync(email, request.fullName(), randomPassword, company.getName());

        return companyMapper.toMemberResponse(savedMember);
    }

    @Override
    public List<CompanyMemberResponse> getMembers(UUID companyId) {
        getCurrentUser();

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
        User currentUser = getCurrentUser();

        if (!companyPermissionService.hasPermission(currentUser.getId(), companyId, CompanyPermission.MANAGE_MEMBERS)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access Denied");
        }

        CompanyMember targetMember = companyMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND, "Member not found."));

        if (!targetMember.getCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.INVALID_MEMBER_ASSOCIATION, "User does not belong to this company.");
        }

        if (targetMember.getCompanyRole() == CompanyRole.OWNER) {
            List<CompanyMember> owners = companyMemberRepository.findAllByCompanyIdAndCompanyRoleAndDeletedFalse(companyId, CompanyRole.OWNER);
            if (owners.size() <= 1) {
                throw new AppException(ErrorCode.CANNOT_REMOVE_OWNER, "Company OWNER cannot be removed. Transfer ownership first.");
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
                .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_FOUND, "Current owner not found."));

        CompanyMember targetMember = companyMemberRepository.findById(targetMemberId)
                .orElseThrow(() -> new AppException(ErrorCode.MEMBER_NOT_FOUND,"Target member not found."));

        if (!targetMember.getCompany().getId().equals(companyId) || targetMember.getMembershipStatus() != MembershipStatus.ACTIVE) {
            throw new AppException(ErrorCode.INVALID_TARGET_MEMBER,"Target member must be an active member of the same company.");
        }

        // Transfer roles
        oldOwnerMember.setCompanyRole(CompanyRole.HR_MANAGER);
        targetMember.setCompanyRole(CompanyRole.OWNER);

        companyMemberRepository.save(oldOwnerMember);
        companyMemberRepository.save(targetMember);

        // Assert exactly 1 owner exists
        List<CompanyMember> owners = companyMemberRepository.findAllByCompanyIdAndCompanyRoleAndDeletedFalse(companyId, CompanyRole.OWNER);
        if (owners.size() != 1) {
            throw new AppException(ErrorCode.INVALID_OWNER_COUNT, "Ownership transfer resulted in an invalid number of owners.");
        }
    }

    @Override
    @Transactional
    public CompanyResponse approveCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found.");
        }

        company.setStatus(CompanyStatus.APPROVED);
        Company savedCompany = companyRepository.save(company);
        return companyMapper.toResponse(savedCompany);
    }

    @Override
    @Transactional
    public CompanyResponse rejectCompany(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_NOT_FOUND, "Company not found.");
        }

        company.setStatus(CompanyStatus.REJECTED);
        Company savedCompany = companyRepository.save(company);
        return companyMapper.toResponse(savedCompany);
    }
}
