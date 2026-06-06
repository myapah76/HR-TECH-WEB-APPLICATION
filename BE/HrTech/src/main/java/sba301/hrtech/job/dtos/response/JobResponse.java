package sba301.hrtech.job.dtos.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import sba301.hrtech.shared.enums.ExtractionStatus;

public record JobResponse(
        UUID id,
        UUID companyId,
        String companyName,
        String companyLogoUrl,
        UUID createdById,
        String createdByName,
        String title,
        String description,
        String location,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String jobType,
        String experienceLevel,
        String status,
        LocalDate deadline,
        String requirements,
        ExtractionStatus extractionStatus,
        List<JobSkillResponse> skills,
        Instant createdAt,
        Instant updatedAt
) {}
