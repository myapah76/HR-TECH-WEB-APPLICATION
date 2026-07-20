package hrtech.job.dtos.request;

import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobType;
import hrtech.job.entities.enums.SalaryType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record JobRequest(
        @NotBlank(message = "Job title is required")
        String title,

        @NotBlank(message = "Job position category is required")
        String position,

        String description,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,

        JobType jobType,

        SalaryType salaryType,

        ExperienceLevel experienceLevel,

        Instant deadline,

        String requirements,
        String benefits,

        @Valid
        List<JobSkillRequest> skills
) {}
