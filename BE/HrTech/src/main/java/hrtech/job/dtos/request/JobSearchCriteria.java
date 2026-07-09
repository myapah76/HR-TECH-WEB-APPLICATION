package hrtech.job.dtos.request;

import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobType;

import java.math.BigDecimal;
import java.util.List;

public record JobSearchCriteria(
                String keyword,
                String location,
                ExperienceLevel experienceLevel,
                JobType jobType,
                BigDecimal salaryMin,
                BigDecimal salaryMax,
                List<String> skills
) {}
