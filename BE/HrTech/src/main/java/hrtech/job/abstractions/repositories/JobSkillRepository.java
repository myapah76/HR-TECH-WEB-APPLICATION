package hrtech.job.abstractions.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import hrtech.job.entities.JobSkill;
import hrtech.job.projections.SkillJobCountProjection;
import hrtech.job.entities.enums.JobStatus;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, UUID> {

    @Query("SELECT js.skillNeo4jId as skillNeo4jId, COUNT(js.job) as jobCount " +
           "FROM JobSkill js " +
           "WHERE js.job.status = :status " +
           "GROUP BY js.skillNeo4jId " +
           "ORDER BY COUNT(js.job) DESC")
    List<SkillJobCountProjection> findTrendingSkills(
            @Param("status") JobStatus status,
            Pageable pageable
    );
}
