package sba301.hrtech.job.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.enums.JobStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    // Find all non-deleted jobs for a company (internal view for OWNER/HR_MANAGER)
    List<Job> findByCompanyIdAndDeletedFalse(UUID companyId);

    // Find all PENDING jobs for a company (for HR Manager approval queue)
    List<Job> findByCompanyIdAndStatusAndDeletedFalse(UUID companyId, JobStatus status);

    // Find all jobs created by a specific user in a company (HR views own jobs)
    List<Job> findByCompanyIdAndCreatedByIdAndDeletedFalse(UUID companyId, UUID createdById);

    // Public candidate search: only OPEN, non-deleted, with dynamic filters
    @Query("""
        SELECT j FROM Job j
        WHERE j.deleted = false
          AND j.status = sba301.hrtech.job.entities.enums.JobStatus.OPEN
          AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                              OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)
          AND (:jobType IS NULL OR j.jobType = :jobType)
          AND (:salaryMin IS NULL OR j.salaryMin >= :salaryMin)
          AND (:salaryMax IS NULL OR j.salaryMax <= :salaryMax)
    """)
    Page<Job> searchOpenJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("experienceLevel") sba301.hrtech.job.entities.enums.ExperienceLevel experienceLevel,
            @Param("jobType") sba301.hrtech.job.entities.enums.JobType jobType,
            @Param("salaryMin") java.math.BigDecimal salaryMin,
            @Param("salaryMax") java.math.BigDecimal salaryMax,
            Pageable pageable
    );
}
