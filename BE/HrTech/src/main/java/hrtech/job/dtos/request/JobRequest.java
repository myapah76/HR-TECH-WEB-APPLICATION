package hrtech.job.dtos.request;

import hrtech.job.entities.enums.ExperienceLevel;
import hrtech.job.entities.enums.JobType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record JobRequest(
        @NotNull(message = "Company ID is required")
        UUID companyId,

        @NotBlank(message = "Job title is required")
        String title,

        @NotBlank(message = "Job position category is required")
        String position,

        String description,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,

        JobType jobType,

        ExperienceLevel experienceLevel,

        Instant deadline,

        String requirements,

        @Valid
        List<JobSkillRequest> skills
) {}
