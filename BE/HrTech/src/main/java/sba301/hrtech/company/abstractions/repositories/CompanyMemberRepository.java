package sba301.hrtech.company.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyMemberRepository extends JpaRepository<CompanyMember, UUID> {
    List<CompanyMember> findByCompanyIdAndDeletedFalse(UUID companyId);
    Optional<CompanyMember> findByCompanyIdAndUserIdAndDeletedFalse(UUID companyId, UUID userId);
    List<CompanyMember> findAllByCompanyIdAndCompanyRoleAndDeletedFalse(UUID companyId, CompanyRole role);
    Optional<CompanyMember> findByUserIdAndDeletedFalse(UUID userId);
    boolean existsByUserIdAndDeletedFalse(UUID userId);
    boolean existsByCompanyIdAndUserIdAndCompanyRoleInAndDeletedFalse(UUID companyId, UUID userId, List<CompanyRole> roles);
}
