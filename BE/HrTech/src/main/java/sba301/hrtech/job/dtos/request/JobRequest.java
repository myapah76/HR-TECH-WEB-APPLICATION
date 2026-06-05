package sba301.hrtech.job.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record JobRequest(
        @NotNull(message = "Company ID is required")
        UUID companyId,

        @NotBlank(message = "Job title is required")
        String title,

        String description,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,

        // Must match JobType enum value string
        String jobType,

        // Must match ExperienceLevel enum value string
        String experienceLevel,

        LocalDate deadline,

        @Valid
        List<JobSkillRequest> skills
) {}
