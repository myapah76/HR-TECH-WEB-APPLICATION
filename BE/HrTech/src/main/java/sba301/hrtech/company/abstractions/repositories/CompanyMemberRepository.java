package sba301.hrtech.company.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sba301.hrtech.company.entities.CompanyMember;
import sba301.hrtech.company.entities.enums.CompanyRole;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyMemberRepository extends JpaRepository<CompanyMember, UUID> {

    Optional<CompanyMember> findByCompanyIdAndUserIdAndDeletedFalse(UUID companyId, UUID userId);

    List<CompanyMember> findByCompanyIdAndDeletedFalse(UUID companyId);

    boolean existsByUserIdAndRoleAndDeletedFalse(UUID userId, CompanyRole role);

    boolean existsByCompanyIdAndUserIdAndRoleAndDeletedFalse(UUID companyId, UUID userId, CompanyRole role);

    Optional<CompanyMember> findByCompanyIdAndUserId(UUID companyId, UUID userId);
}

