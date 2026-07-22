package hrtech.job.dtos.response;

import java.time.Instant;
import java.util.UUID;

public record RecruiterManageJobResponse(
        UUID id,
        UUID companyId,
        String companyName,
        UUID createdById,
        String title,
        String location,
        String status,
        Instant deadline,
        long newApplicationsCount,
        long totalApplicationsCount,
        long interviewsCount,
        int appealCount,
        Instant createdAt
) {}
