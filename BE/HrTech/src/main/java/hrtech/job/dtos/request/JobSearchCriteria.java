package hrtech.job.dtos.request;

import java.math.BigDecimal;

public record JobSearchCriteria(
        String keyword,
        String location,
        String experienceLevel,
        String jobType,
        BigDecimal salaryMin,
        BigDecimal salaryMax
) {}
