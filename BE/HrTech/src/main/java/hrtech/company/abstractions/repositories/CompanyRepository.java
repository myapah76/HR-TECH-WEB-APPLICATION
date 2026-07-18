package hrtech.company.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import hrtech.company.entities.Company;

import hrtech.company.projections.TopCompanyProjection;
import hrtech.company.entities.enums.CompanyStatus;
import hrtech.job.entities.enums.JobStatus;

import java.time.Instant;
import java.util.List;
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
       Page<Company> searchCompanies(@Param("keyword") String keyword, Pageable pageable);

       @Query(value = "SELECT * FROM companies WHERE id = :id", nativeQuery = true)
       Optional<Company> findCompanyByIdIncludingDeleted(@Param("id") UUID id);

       @Query(value = "SELECT c.* FROM companies c WHERE " +
                     "(:keyword IS NULL OR :keyword = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.tax_code) LIKE LOWER(CONCAT('%', :keyword, '%')))", nativeQuery = true)
       Page<Company> searchCompaniesForAdmin(@Param("keyword") String keyword,
                     Pageable pageable);

       @Query("SELECT c.id as id, c.name as name, c.logoUrl as logoUrl, COUNT(j) as activeJobsCount " +
              "FROM Company c " +
              "LEFT JOIN c.jobs j ON j.status = :jobStatus " +
              "WHERE c.status = :companyStatus " +
              "GROUP BY c.id, c.name, c.logoUrl " +
              "ORDER BY COUNT(j) DESC, c.name ASC")
       List<TopCompanyProjection> findTopCompanies(
              @Param("jobStatus") JobStatus jobStatus,
              @Param("companyStatus") CompanyStatus companyStatus,
              Pageable pageable);

       long countByStatus(CompanyStatus status);

       long countByCreatedAtAfter(Instant date);
}
