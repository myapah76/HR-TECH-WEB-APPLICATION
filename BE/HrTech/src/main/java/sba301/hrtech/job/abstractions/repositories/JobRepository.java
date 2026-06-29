package sba301.hrtech.job.abstractions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.enums.JobStatus;
import sba301.hrtech.job.entities.enums.ExperienceLevel;
import sba301.hrtech.job.entities.enums.JobType;
import sba301.hrtech.shared.enums.ExtractionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

  List<Job> findByCompanyIdAndDeletedFalse(UUID companyId);

  List<Job> findByStatusAndDeadlineLessThanEqualAndDeletedFalse(JobStatus status, Instant deadline);

  List<Job> findByCompanyIdAndStatusAndDeletedFalse(UUID companyId, JobStatus status);

  List<Job> findByCompanyIdAndCreatedByIdAndDeletedFalse(UUID companyId, UUID createdById);

  Page<Job> findByStatus(JobStatus status, Pageable pageable);

  @Query("""
          SELECT j FROM Job j
          JOIN j.company c
          WHERE j.deleted = false
            AND j.status = sba301.hrtech.job.entities.enums.JobStatus.APPROVED
            AND (:keyword IS NULL OR LOWER(j.title) LIKE :keyword
                                OR LOWER(j.description) LIKE :keyword
                                OR LOWER(c.name) LIKE :keyword)
            AND (:location IS NULL OR LOWER(j.location) LIKE :location)
            AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)
            AND (:jobType IS NULL OR j.jobType = :jobType)
            AND (:salaryMin IS NULL OR j.salaryMax >= :salaryMin)
            AND (:salaryMax IS NULL OR j.salaryMin <= :salaryMax)

      """)
  Page<Job> searchOpenJobs(
      @Param("keyword") String keyword,
      @Param("location") String location,
      @Param("experienceLevel") ExperienceLevel experienceLevel,
      @Param("jobType") JobType jobType,
      @Param("salaryMin") BigDecimal salaryMin,
      @Param("salaryMax") BigDecimal salaryMax,
      Pageable pageable);

  @Query("SELECT j FROM Job j WHERE j.deleted = false AND j.extractionStatus IN :statuses AND j.updatedAt < :threshold")
  List<Job> findStuckJobs(@Param("statuses") List<ExtractionStatus> statuses, @Param("threshold") Instant threshold);

  @Query("SELECT j FROM Job j")
  @EntityGraph(attributePaths = { "jobSkills" })
  List<Job> findAllWithSkills();

  @Query("""
          SELECT j FROM Job j
          WHERE j.deleted = false
            AND j.company.id = :companyId
            AND (:status IS NULL OR j.status = :status)
            AND (:jobType IS NULL OR j.jobType = :jobType)
          ORDER BY j.createdAt DESC
      """)
  Page<Job> findCompanyJobsWithFilters(
      @Param("companyId") UUID companyId,
      @Param("status") JobStatus status,
      @Param("jobType") JobType jobType,
      Pageable pageable);
}
