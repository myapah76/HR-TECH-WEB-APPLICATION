package sba301.hrtech.company.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.abstractions.repositories.RoleRepository;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.entities.Role;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.enums.CompanySize;
import sba301.hrtech.company.entities.enums.CompanyStatus;
import sba301.hrtech.company.mapper.CompanyMapper;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.shared.services.CloudinaryService;

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
    private final OcrService ocrService;
    private final TaxVerificationService taxVerificationService;
    private final CompanyMapper companyMapper;
    private final CloudinaryService cloudinaryService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.user();
        }
        throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User is not authenticated");
    }

    private void validateOwner(UUID companyId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));
        if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not a member of this company.");
        }
        if (user.getRole() == null || !"COMPANY_OWNER".equals(user.getRole().getName())) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only company OWNER can perform this action.");
        }
    }

    @Override
    @Transactional
    public CompanyResponse registerCompany(CompanyRegisterRequest request, MultipartFile businessLicenseFile) {
        User currentUser = getCurrentUser();

        // 1. Verify user does not already own/belong to a company, or have an active registration
        if (currentUser.getCompany() != null || companyRepository.existsByOwnerIdAndDeletedFalse(currentUser.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "ALREADY_OWNS_COMPANY", "Each user can only register or belong to one company.");
        }

        // 2. Perform OCR
        String taxCode = ocrService.extractTaxCode(businessLicenseFile);

        // 3. Check duplicate tax code
        Optional<Company> existingCompanyOpt = companyRepository.findByTaxCode(taxCode);
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
            
            // Upload business license file to Cloudinary
            String licenseUrl = cloudinaryService.uploadFile(businessLicenseFile, "company/licenses");
            existingCompany.setBusinessLicenseUrl(licenseUrl);
            existingCompany.setOwner(currentUser);

            Company savedCompany = companyRepository.save(existingCompany);

            return companyMapper.toResponse(savedCompany);
        }

        // 4. Verify with VietQR API
        taxVerificationService.verifyTaxCode(taxCode);

        // 5. Create Company
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
        
        // Upload business license file to Cloudinary
        String licenseUrl = cloudinaryService.uploadFile(businessLicenseFile, "TaxCode");
        company.setBusinessLicenseUrl(licenseUrl);
        company.setOwner(currentUser);

        Company savedCompany = companyRepository.save(company);

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
        validateOwner(companyId, currentUser.getId());

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

        // Disassociate all members and reset their roles to CANDIDATE
        List<User> members = userRepository.findByCompanyIdAndDeletedFalse(companyId);
        for (User u : members) {
            u.setCompany(null);
            roleRepository.findByName("CANDIDATE").ifPresent(role -> {
                u.setRole(role);
            });
            userRepository.save(u);
        }
    }

    @Override
    @Transactional
    public CompanyMemberResponse addMember(UUID companyId, AddMemberRequest request) {
        User currentUser = getCurrentUser();
        validateOwner(companyId, currentUser.getId());

        UUID targetUserId = UUID.fromString(request.userId());
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Target user not found."));

        if (targetUser.getCompany() != null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "ALREADY_MEMBER", "User is already a member of a company.");
        }

        String requestedRole = request.role();
        if ("COMPANY_OWNER".equals(requestedRole) || "OWNER".equals(requestedRole)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_ASSIGN_OWNER", "Cannot assign OWNER role via member management.");
        }

        if (!"HR".equals(requestedRole) && !"HR_MANAGER".equals(requestedRole)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Invalid company role. Must be HR or HR_MANAGER.");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));

        Role role = roleRepository.findByName(requestedRole)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "Role not found."));

        targetUser.setCompany(company);
        targetUser.setRole(role);
        User savedUser = userRepository.save(targetUser);

        return companyMapper.toMemberResponse(savedUser);
    }

    @Override
    public List<CompanyMemberResponse> getMembers(UUID companyId) {
        getCurrentUser();

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
             throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        return userRepository.findByCompanyIdAndDeletedFalse(companyId)
                .stream()
                .map(companyMapper::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeMember(UUID companyId, UUID memberId) {
        User currentUser = getCurrentUser();
        validateOwner(companyId, currentUser.getId());

        User targetUser = userRepository.findById(memberId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "Member user not found."));

        if (targetUser.getCompany() == null || !targetUser.getCompany().getId().equals(companyId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_MEMBER_ASSOCIATION", "User does not belong to this company.");
        }

        if (targetUser.getRole() != null && "COMPANY_OWNER".equals(targetUser.getRole().getName())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_REMOVE_OWNER", "Company OWNER cannot be removed.");
        }

        // Revert global role to CANDIDATE and clear company
        targetUser.setCompany(null);
        roleRepository.findByName("CANDIDATE").ifPresent(role -> {
            targetUser.setRole(role);
        });
        userRepository.save(targetUser);
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

        // Link company and update global role of owner to COMPANY_OWNER upon approval
        if (savedCompany.getOwner() != null) {
            User ownerUser = savedCompany.getOwner();
            roleRepository.findByName("COMPANY_OWNER").ifPresent(role -> {
                ownerUser.setRole(role);
                ownerUser.setCompany(savedCompany);
                userRepository.save(ownerUser);
            });
        }

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
