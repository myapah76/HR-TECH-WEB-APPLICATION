package hrtech.job.abstractions.repositories;

import hrtech.job.projections.PositionJobCountProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobType;
import hrtech.shared.enums.ExtractionStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID>, QuerydslPredicateExecutor<Job> {

  List<Job> findByCompanyIdAndDeletedFalse(UUID companyId);

  List<Job> findByStatusAndDeadlineLessThanEqualAndDeletedFalse(JobStatus status, Instant deadline);

  List<Job> findByCompanyIdAndStatusAndDeletedFalse(UUID companyId, JobStatus status);

  List<Job> findByCompanyIdAndCreatedByIdAndDeletedFalse(UUID companyId, UUID createdById);

  @EntityGraph(attributePaths = { "company", "createdBy", "jobSkills" })
  Page<Job> findByStatus(JobStatus status, Pageable pageable);

  @Query("SELECT j FROM Job j WHERE j.deleted = false AND j.extractionStatus IN :statuses AND j.updatedAt < :threshold")
  List<Job> findStuckJobs(@Param("statuses") List<ExtractionStatus> statuses, @Param("threshold") Instant threshold);

  @EntityGraph(attributePaths = { "company", "createdBy", "jobSkills" })
  @Query("""
          SELECT j FROM Job j
          WHERE j.deleted = false
            AND j.company.id = :companyId
            AND (:status IS NULL OR j.status = :status)
            AND (:jobType IS NULL OR j.jobType = :jobType)
            AND (:jobLevel IS NULL OR j.experienceLevel = :jobLevel)
            AND (:createdById IS NULL OR j.createdBy.id = :createdById)
          ORDER BY j.createdAt DESC
      """)
  Page<Job> findCompanyJobsWithFilters(
      @Param("companyId") UUID companyId,
      @Param("status") JobStatus status,
      @Param("jobType") JobType jobType,
      @Param("jobLevel") ExperienceLevel jobLevel,
      @Param("createdById") UUID createdById,
      Pageable pageable);

  @EntityGraph(attributePaths = { "company", "createdBy", "jobSkills" })
  @Query("""
          SELECT j FROM Job j
          LEFT JOIN j.company c
          WHERE j.deleted = false
            AND (:keyword IS NULL OR LOWER(j.title) LIKE :keyword OR LOWER(c.name) LIKE :keyword)
            AND (:status IS NULL OR j.status = :status)
      """)
  Page<Job> findAllJobsForAdmin(
      @Param("keyword") String keyword,
      @Param("status") JobStatus status,
      Pageable pageable);

  @Query("SELECT j.position as name, COUNT(j) as jobCount " +
      "FROM Job j " +
      "WHERE j.status = :status AND j.deleted = false AND j.position IS NOT NULL " +
      "GROUP BY j.position " +
      "ORDER BY COUNT(j) DESC")
  List<PositionJobCountProjection> findHotPositionsByStatus(
      @Param("status") JobStatus status,
      Pageable pageable);

  long countByStatus(JobStatus status);
}
