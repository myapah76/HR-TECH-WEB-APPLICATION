package sba301.hrtech.job.mapper;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.request.JobSkillRequest;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.job.dtos.response.JobSkillResponse;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.job.entities.JobDocument;
import sba301.hrtech.job.entities.JobSkill;
import sba301.hrtech.job.entities.enums.ExperienceLevel;
import sba301.hrtech.job.entities.enums.JobType;
import sba301.hrtech.shared.common.ErrorCode;
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


    public JobDocument toDocument(Job job) {

        List<String> skills = job.getJobSkills()
                .stream()
                .map(js -> js.getSkillNeo4jId()) // or resolve name if needed
                .toList();

        return JobDocument.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .skills(skills)
                .build();
    }

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
                throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST,
                        "Invalid job type: " + request.jobType());
            }
        }
        if (request.experienceLevel() != null) {
            try {
                job.setExperienceLevel(ExperienceLevel.valueOf(request.experienceLevel()));
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST,
                        "Invalid experience level: " + request.experienceLevel());
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
                throw new AppException(HttpStatus.BAD_REQUEST,
                        ErrorCode.JOB_SKILL_NOT_FOUND,
                        "Skill not found in skill graph: " + sr.skillNeo4jId());
            }
            SkillLevel level = null;
            if (sr.requiredLevel() != null) {
                try {
                    level = SkillLevel.valueOf(sr.requiredLevel());
                } catch (IllegalArgumentException e) {
                    throw new AppException(HttpStatus.BAD_REQUEST,
                            ErrorCode.BAD_REQUEST,
                            "Invalid skill level: " + sr.requiredLevel());
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
