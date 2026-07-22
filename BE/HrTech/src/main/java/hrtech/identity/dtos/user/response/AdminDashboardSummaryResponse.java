package hrtech.identity.dtos.user.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardSummaryResponse {
    private long totalUsers;
    private long newUsersToday;
    private long totalJobs;
    private long newJobsToday;
    private long totalCompanies;
    private long newCompaniesToday;
    private SystemActivitiesResponse systemActivities;
    private UserDistributionResponse userDistribution;
    private List<RevenueMonthResponse> revenueHistory;
    private List<WeeklyProfitResponse> weeklyProfit;
    private AdminTodoResponse adminTodo;
    private List<PackageUsageResponse> topPackages;
    private List<AIUsageResponse> aiUsage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueMonthResponse {
        private String month;
        private long revenue;
        private long sales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyProfitResponse {
        private String day;
        private long revenue;
        private long sales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemActivitiesResponse {
        private long newUsersToday;
        private long newJobsToday;
        private long applicationsToday;
        private long cvScansToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDistributionResponse {
        private long candidates;
        private double candidatePercentage;
        private long recruiters;
        private double recruiterPercentage;
        private long admins;
        private double adminPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminTodoResponse {
        private long pendingCompanies;
        private long pendingComplaints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageUsageResponse {
        private String name;
        private long salesCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIUsageResponse {
        private String featureName;
        private long usageCount;
    }
}
