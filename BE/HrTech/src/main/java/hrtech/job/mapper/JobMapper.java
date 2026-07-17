package hrtech.job.mapper;

import org.mapstruct.*;
import hrtech.job.dtos.request.JobRequest;
import hrtech.job.dtos.request.JobSkillRequest;
import hrtech.job.dtos.response.JobResponse;
import hrtech.job.dtos.response.JobSkillResponse;
import hrtech.job.entities.Job;
import hrtech.job.entities.JobSkill;
import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobType;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.enums.SkillLevel;
import hrtech.shared.exceptions.AppException;
import hrtech.skill.abstractions.services.ISkillService;
import hrtech.skill.dtos.response.SkillResponse;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class JobMapper {

    @Autowired
    protected ISkillService skillService;

    private final Map<String, String> skillNameCache = new ConcurrentHashMap<>();

    public abstract Job toEntity(JobRequest request);

    @Mapping(target = "companyId", source = "company.id")
    @Mapping(target = "companyName", source = "company.name")
    @Mapping(target = "companyLogoUrl", source = "company.logoUrl")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", expression = "java(job.getCreatedBy() != null ? job.getCreatedBy().getFirstName() + \" \" + job.getCreatedBy().getLastName() : null)")
    @Mapping(target = "jobType", expression = "java(job.getJobType() != null ? job.getJobType().name() : null)")
    @Mapping(target = "experienceLevel", expression = "java(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)")
    @Mapping(target = "status", expression = "java(job.getStatus() != null ? job.getStatus().name() : null)")
    @Mapping(target = "skills", source = "jobSkills")
    @Mapping(target = "rejectionReason", ignore = true)
    public abstract JobResponse toResponse(Job job);

    @Mapping(target = "skillName", expression = "java(resolveSkillName(jobSkill.getSkillNeo4jId()))")
    @Mapping(target = "requiredLevel", expression = "java(jobSkill.getRequiredLevel() != null ? jobSkill.getRequiredLevel().name() : null)")
    public abstract JobSkillResponse toSkillResponse(JobSkill jobSkill);

    public abstract void updateJobFromRequest(JobRequest request, @MappingTarget Job job);

    public void preloadSkillNames(List<Job> jobs) {
        if (jobs == null || jobs.isEmpty())
            return;

        Set<String> missingIds = jobs.stream()
                .filter(j -> j.getJobSkills() != null)
                .flatMap(j -> j.getJobSkills().stream())
                .map(j -> j.getSkillNeo4jId())
                .filter(id -> id != null && !skillNameCache.containsKey(id))
                .collect(Collectors.toSet());

        if (!missingIds.isEmpty()) {
            try {
                List<SkillResponse> nodes = skillService.getSkillsByIds(missingIds);
                for (SkillResponse node : nodes) {
                    if (node.getId() != null && node.getName() != null) {
                        skillNameCache.put(node.getId(), node.getName());
                    }
                }
            } catch (Exception e) {
                // Fallback gracefully if Neo4j is temporarily reconnecting
            }
        }
    }

    protected String resolveSkillName(String skillNeo4jId) {
        if (skillNeo4jId == null)
            return null;
        return skillNameCache.computeIfAbsent(skillNeo4jId, id -> skillService.findSkillById(id)
                .map(node -> node.getName())
                .orElse(id));
    }

    public List<JobSkill> buildJobSkills(Job job, List<JobSkillRequest> skillRequests) {
        if (skillRequests == null || skillRequests.isEmpty()) {
            return new ArrayList<>();
        }
        List<JobSkill> result = new ArrayList<>();
        for (JobSkillRequest sr : skillRequests) {
            // Validate skill exists in Neo4j
            if (skillService.findSkillById(sr.skillNeo4jId()).isEmpty()) {
                throw new AppException(
                        ErrorCode.JOB_SKILL_NOT_FOUND,
                        "Skill not found in skill graph: " + sr.skillNeo4jId());
            }
            SkillLevel level = null;
            if (sr.requiredLevel() != null) {
                try {
                    level = SkillLevel.valueOf(sr.requiredLevel());
                } catch (IllegalArgumentException e) {
                    throw new AppException(
                            ErrorCode.BAD_REQUEST,
                            "Invalid skill level: " + sr.requiredLevel());
                }
            }
            JobSkill js = JobSkill.builder()
                    .job(job)
                    .skillNeo4jId(sr.skillNeo4jId())
                    .requiredLevel(level)
                    .isAiExtracted(false)
                    .build();
            result.add(js);
        }
        return result;
    }
}
