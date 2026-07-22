package hrtech.job.dtos.response;

public record RecruiterJobStatsResponse(
    long approvedJobsCount,
    long closedJobsCount,
    long totalJobsCount,
    long totalApplicantsCount
) {}
