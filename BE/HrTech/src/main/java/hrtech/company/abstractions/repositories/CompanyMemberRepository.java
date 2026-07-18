package hrtech.company.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import hrtech.company.entities.CompanyMember;
import hrtech.company.entities.enums.CompanyRole;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyMemberRepository extends JpaRepository<CompanyMember, UUID> {
    List<CompanyMember> findByCompanyIdAndDeletedFalse(UUID companyId);

    Optional<CompanyMember> findByCompanyIdAndUserIdAndDeletedFalse(UUID companyId, UUID userId);

    List<CompanyMember> findAllByCompanyIdAndCompanyRoleAndDeletedFalse(UUID companyId, CompanyRole role);

    Optional<CompanyMember> findByUserIdAndDeletedFalse(UUID userId);

    boolean existsByCompanyIdAndUserIdAndCompanyRoleInAndDeletedFalse(UUID companyId, UUID userId, List<CompanyRole> roles);

    @Query(value = "SELECT * FROM company_members WHERE company_id = :companyId", nativeQuery = true)
    List<CompanyMember> findAllMembersIncludingDeleted(@Param("companyId") UUID companyId);
}
