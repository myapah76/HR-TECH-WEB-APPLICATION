package sba301.hrtech.company.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.company.entities.Company;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByTaxCode(String taxCode);

    @Query(value = "SELECT c.* FROM companies c JOIN company_members cm ON c.id = cm.company_id WHERE cm.user_id = :userId", nativeQuery = true)
    Optional<Company> findCompanyByUserIdIncludingDeleted(@Param("userId") UUID userId);

    boolean existsByTaxCode(String taxCode);
}

