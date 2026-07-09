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
import hrtech.skill.abstractions.repositories.SkillNodeRepository;
import hrtech.skill.entities.SkillNode;
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
    protected SkillNodeRepository skillNodeRepository;

    private final Map<String, String> skillNameCache = new ConcurrentHashMap<>();

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

    public void preloadSkillNames(List<Job> jobs) {
        if (jobs == null || jobs.isEmpty()) return;

        Set<String> missingIds = jobs.stream()
                .filter(j -> j.getJobSkills() != null)
                .flatMap(j -> j.getJobSkills().stream())
                .map(j -> j.getSkillNeo4jId())
                .filter(id -> id != null && !skillNameCache.containsKey(id))
                .collect(Collectors.toSet());

        if (!missingIds.isEmpty()) {
            try {
                List<SkillNode> nodes = skillNodeRepository.findAllByIds(new ArrayList<>(missingIds));
                for (SkillNode node : nodes) {
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
        if (skillNeo4jId == null) return null;
        return skillNameCache.computeIfAbsent(skillNeo4jId, id ->
                skillNodeRepository.findById(id)
                        .map(node -> node.getName())
                        .orElse(id)
        );
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
                throw new AppException(ErrorCode.BAD_REQUEST,
                        "Invalid job type: " + request.jobType());
            }
        }
        if (request.experienceLevel() != null) {
            try {
                job.setExperienceLevel(ExperienceLevel.valueOf(request.experienceLevel()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST,
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
