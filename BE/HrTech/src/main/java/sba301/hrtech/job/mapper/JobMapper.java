package sba301.hrtech.job.mapper;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSkillRequest;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.dtos.response.JobSkillResponse;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.job.entities.enums.ExperienceLevel;
import sba301.hrtech.job.entities.enums.JobType;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.enums.SkillLevel;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.abstractions.repositories.SkillNodeRepository;
import sba301.hrtech.skill.entities.SkillNode;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public abstract class JobMapper {

    @Autowired
    protected SkillNodeRepository skillNodeRepository;

    @Mapping(target = "companyId", source = "company.id")
    @Mapping(target = "companyName", source = "company.name")
    @Mapping(target = "companyLogoUrl", source = "company.logoUrl")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", expression = "java(job.getCreatedBy() != null ? job.getCreatedBy().getFirstName() + \" \" + job.getCreatedBy().getLastName() : null)")
    @Mapping(target = "jobType", expression = "java(job.getJobType() != null ? job.getJobType().name() : null)")
    @Mapping(target = "experienceLevel", expression = "java(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)")
    @Mapping(target = "status", expression = "java(job.getStatus() != null ? job.getStatus().name() : null)")
    @Mapping(target = "skills", source = "jobSkills")
    public abstract JobResponse toResponse(Job job);

    @Mapping(target = "skillName", expression = "java(resolveSkillName(jobSkill.getSkillNeo4jId()))")
    @Mapping(target = "requiredLevel", expression = "java(jobSkill.getRequiredLevel() != null ? jobSkill.getRequiredLevel().name() : null)")
    public abstract JobSkillResponse toSkillResponse(JobSkill jobSkill);

    protected String resolveSkillName(String skillNeo4jId) {
        if (skillNeo4jId == null) return null;
        return skillNodeRepository.findById(skillNeo4jId)
                .map(SkillNode::getName)
                .orElse(skillNeo4jId);
    }

    public void applyJobFields(Job job, JobRequest request) {
        job.setTitle(request.title());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setLocation(request.location());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setDeadline(request.deadline());

        if (request.jobType() != null) {
            try {
                job.setJobType(JobType.valueOf(request.jobType()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }
        if (request.experienceLevel() != null) {
            try {
                job.setExperienceLevel(ExperienceLevel.valueOf(request.experienceLevel()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }
    }

    public List<JobSkill> buildJobSkills(Job job, List<JobSkillRequest> skillRequests) {
        if (skillRequests == null || skillRequests.isEmpty()) {
            return new ArrayList<>();
        }
        List<JobSkill> result = new ArrayList<>();
        for (JobSkillRequest sr : skillRequests) {
            // Validate skill exists in Neo4j
            if (!skillNodeRepository.existsById(sr.skillNeo4jId())) {
                throw new AppException(ErrorCode.JOB_SKILL_NOT_FOUND);
            }
            SkillLevel level = null;
            if (sr.requiredLevel() != null) {
                try {
                    level = SkillLevel.valueOf(sr.requiredLevel());
                } catch (IllegalArgumentException e) {
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
            }
            JobSkill js = JobSkill.builder()
                    .job(job)
                    .skillNeo4jId(sr.skillNeo4jId())
                    .requiredLevel(level)
                    .isMandatory(sr.isMandatory())
                    .build();
            result.add(js);
        }
        return result;
    }
}
