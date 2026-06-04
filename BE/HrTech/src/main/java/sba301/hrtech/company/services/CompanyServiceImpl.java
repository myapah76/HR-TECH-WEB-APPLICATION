package sba301.hrtech.company.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;
import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.company.abstractions.repositories.CompanyMemberRepository;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.abstractions.services.ICompanyService;
import sba301.hrtech.company.dtos.request.AddMemberRequest;
import sba301.hrtech.company.dtos.request.CompanyRegisterRequest;
import sba301.hrtech.company.dtos.request.CompanyUpdateRequest;
import sba301.hrtech.company.dtos.response.CompanyMemberResponse;
import sba301.hrtech.company.dtos.response.CompanyResponse;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyRole;
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
    private final CompanyMemberRepository companyMemberRepository;
    private final UserRepository userRepository;
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
        CompanyMember member = companyMemberRepository.findByCompanyIdAndUserIdAndDeletedFalse(companyId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not a member of this company."));
        if (member.getRole() != CompanyRole.OWNER) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only company OWNER can perform this action.");
        }
    }

    @Override
    @Transactional
    public CompanyResponse registerCompany(CompanyRegisterRequest request, MultipartFile businessLicenseFile) {
        User currentUser = getCurrentUser();

        // 1. Verify user does not already own a company
        boolean ownsCompany = companyMemberRepository.existsByUserIdAndRoleAndDeletedFalse(currentUser.getId(), CompanyRole.OWNER);
        if (ownsCompany) {
            throw new AppException(HttpStatus.BAD_REQUEST, "ALREADY_OWNS_COMPANY", "Each user can only own one company.");
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

            Company savedCompany = companyRepository.save(existingCompany);

            // Re-activate or create OWNER CompanyMember
            Optional<CompanyMember> existingOwnerOpt = companyMemberRepository.findByCompanyIdAndUserId(savedCompany.getId(), currentUser.getId());
            if (existingOwnerOpt.isPresent()) {
                CompanyMember existingOwner = existingOwnerOpt.get();
                existingOwner.setDeleted(false);
                existingOwner.setRole(CompanyRole.OWNER);
                companyMemberRepository.save(existingOwner);
            } else {
                CompanyMember ownerMember = new CompanyMember();
                ownerMember.setCompany(savedCompany);
                ownerMember.setUser(currentUser);
                ownerMember.setRole(CompanyRole.OWNER);
                companyMemberRepository.save(ownerMember);
            }

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

        Company savedCompany = companyRepository.save(company);

        // 6. Create OWNER CompanyMember
        CompanyMember ownerMember = new CompanyMember();
        ownerMember.setCompany(savedCompany);
        ownerMember.setUser(currentUser);
        ownerMember.setRole(CompanyRole.OWNER);
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
        validateOwner(companyId, currentUser.getId());

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));
        if (company.isDeleted()) {
            throw new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found.");
        }

        company.setDeleted(true);
        companyRepository.save(company);

        List<CompanyMember> members = companyMemberRepository.findByCompanyIdAndDeletedFalse(companyId);
        for (CompanyMember m : members) {
            m.setDeleted(true);
            companyMemberRepository.save(m);
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

        CompanyRole requestedRole;
        try {
            requestedRole = CompanyRole.valueOf(request.role());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Invalid company role.");
        }

        if (requestedRole == CompanyRole.OWNER) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_ASSIGN_OWNER", "Cannot assign OWNER role via member management.");
        }

        Optional<CompanyMember> existingMemberOpt = companyMemberRepository.findByCompanyIdAndUserId(companyId, targetUserId);
        if (existingMemberOpt.isPresent()) {
            CompanyMember existingMember = existingMemberOpt.get();
            if (!existingMember.isDeleted()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "ALREADY_MEMBER", "User is already a member of this company.");
            }
            // Re-activate and update role
            existingMember.setDeleted(false);
            existingMember.setRole(requestedRole);
            CompanyMember savedMember = companyMemberRepository.save(existingMember);
            return companyMapper.toMemberResponse(savedMember);
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND", "Company not found."));

        CompanyMember newMember = new CompanyMember();
        newMember.setCompany(company);
        newMember.setUser(targetUser);
        newMember.setRole(requestedRole);
        CompanyMember savedMember = companyMemberRepository.save(newMember);

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
        validateOwner(companyId, currentUser.getId());

        CompanyMember member = companyMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "Member record not found."));

        if (!member.getCompany().getId().equals(companyId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_MEMBER_ASSOCIATION", "Member does not belong to this company.");
        }

        if (member.getRole() == CompanyRole.OWNER) {
            throw new AppException(HttpStatus.BAD_REQUEST, "CANNOT_REMOVE_OWNER", "Company OWNER cannot be removed.");
        }

        member.setDeleted(true);
        companyMemberRepository.save(member);
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
