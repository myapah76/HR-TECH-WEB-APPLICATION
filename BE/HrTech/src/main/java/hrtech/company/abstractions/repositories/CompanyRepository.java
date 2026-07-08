package hrtech.company.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import hrtech.company.entities.Company;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByTaxCode(String taxCode);

    @Query(value = "SELECT c.* FROM companies c JOIN company_members cm ON c.id = cm.company_id WHERE cm.user_id = :userId", nativeQuery = true)
    Optional<Company> findCompanyByUserIdIncludingDeleted(@Param("userId") UUID userId);

    boolean existsByTaxCode(String taxCode);

    @Query(value = "SELECT c.* FROM companies c WHERE c.is_deleted = false AND c.status = 'APPROVED' AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))", nativeQuery = true)
    org.springframework.data.domain.Page<Company> searchCompanies(@Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT * FROM companies WHERE id = :id", nativeQuery = true)
    Optional<Company> findCompanyByIdIncludingDeleted(@Param("id") java.util.UUID id);

    @Query(value = "SELECT c.* FROM companies c WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.tax_code) LIKE LOWER(CONCAT('%', :keyword, '%')))", nativeQuery = true)
    org.springframework.data.domain.Page<Company> searchCompaniesForAdmin(@Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);
}

