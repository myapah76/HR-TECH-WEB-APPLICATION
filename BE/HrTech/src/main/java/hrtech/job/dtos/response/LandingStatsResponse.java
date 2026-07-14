package hrtech.job.dtos.response;

public record LandingStatsResponse(
    long totalJobs,
    long totalCompanies,
    long totalApplications
) {}
