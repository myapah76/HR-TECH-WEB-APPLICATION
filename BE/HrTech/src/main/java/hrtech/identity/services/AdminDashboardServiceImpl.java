package hrtech.identity.services;

import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.company.abstractions.repositories.CompanyRepository;
import hrtech.cv.abstractions.repositories.CvRepository;
import hrtech.identity.abstractions.repositories.UserRepository;
import hrtech.identity.abstractions.services.IAdminDashboardService;
import hrtech.identity.dtos.user.response.AdminDashboardSummaryResponse;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.payment.entities.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;
import hrtech.payment.abstractions.repositories.PaymentRepository;
import hrtech.subscription.abstractions.repositories.CompanySubscriptionRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static hrtech.company.entities.enums.CompanyStatus.PENDING;
import static hrtech.job.entities.enums.JobStatus.APPEALED;
import static hrtech.payment.entities.enums.PaymentStatus.PAID;
import static java.time.DayOfWeek.MONDAY;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements IAdminDashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final CvRepository cvRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final PaymentRepository paymentRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;

    @Override
    public AdminDashboardSummaryResponse getAdminDashboardSummary() {

        Instant todayStart = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();


        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(todayStart);

        long totalJobs = jobRepository.count();
        long newJobsToday = jobRepository.countByCreatedAtAfter(todayStart);

        long totalCompanies = companyRepository.count();
        long newCompaniesToday = companyRepository.countByCreatedAtAfter(todayStart);


        long dailyVisits = 0;
        String todayStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String redisKey = "traffic:visits:" + todayStr;
        try {
            Object val = redisTemplate.opsForValue().get(redisKey);
            if (val != null) {
                if (val instanceof Number) {
                    dailyVisits = ((Number) val).longValue();
                } else {
                    dailyVisits = Long.parseLong(val.toString());
                }
            }
        } catch (Exception e) {
            dailyVisits = 0;
        }


        long applicationsToday = applicationRepository.countByCreatedAtAfter(todayStart);
        long cvScansToday = cvRepository.countByCreatedAtAfter(todayStart);

        AdminDashboardSummaryResponse.SystemActivitiesResponse systemActivities =
                AdminDashboardSummaryResponse.SystemActivitiesResponse.builder()
                        .newUsersToday(newUsersToday)
                        .newJobsToday(newJobsToday)
                        .applicationsToday(applicationsToday)
                        .cvScansToday(cvScansToday)
                        .build();


        long candidates = userRepository.countByRoleName("CANDIDATE");
        long recruiters = userRepository.countByRoleName("RECRUITER");
        long admins = userRepository.countByRoleName("ADMIN_SYSTEM");

        double candidatePct = 0;
        double recruiterPct = 0;
        double adminPct = 0;

        if (totalUsers > 0) {
            candidatePct = Math.round(((double) candidates / totalUsers * 100) * 10.0) / 10.0;
            recruiterPct = Math.round(((double) recruiters / totalUsers * 100) * 10.0) / 10.0;
            adminPct = Math.round(((double) admins / totalUsers * 100) * 10.0) / 10.0;
        }

        AdminDashboardSummaryResponse.UserDistributionResponse userDistribution =
                AdminDashboardSummaryResponse.UserDistributionResponse.builder()
                        .candidates(candidates)
                        .candidatePercentage(candidatePct)
                        .recruiters(recruiters)
                        .recruiterPercentage(recruiterPct)
                        .admins(admins)
                        .adminPercentage(adminPct)
                        .build();


      List<AdminDashboardSummaryResponse.RevenueMonthResponse> revenueHistory = new java.util.ArrayList<>();
        LocalDate sixMonthsAgoLocalDate = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        Instant sixMonthsAgo = sixMonthsAgoLocalDate.atStartOfDay(ZoneId.systemDefault()).toInstant();

      List<Payment> paidPayments =
                paymentRepository.findAllByStatusAndCreatedAtAfter(PAID, sixMonthsAgo);

        for (int i = 0; i < 6; i++) {
            LocalDate targetMonth = sixMonthsAgoLocalDate.plusMonths(i);
            String monthLabel = "T" + targetMonth.getMonthValue();

           List<Payment> targetMonthPayments = paidPayments.stream()
                    .filter(p -> {
                        LocalDate paymentDate = p.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
                        return paymentDate.getYear() == targetMonth.getYear() && paymentDate.getMonth() == targetMonth.getMonth();
                    })
                    .collect(java.util.stream.Collectors.toList());

            long sum = targetMonthPayments.stream()
                    .mapToLong(p -> p.getAmount() != null ? p.getAmount() : 0L)
                    .sum();
            long salesCount = targetMonthPayments.size();

            revenueHistory.add(new AdminDashboardSummaryResponse.RevenueMonthResponse(monthLabel, sum, salesCount));
        }


        List<AdminDashboardSummaryResponse.WeeklyProfitResponse> weeklyProfit = new ArrayList<>();
        LocalDate mondayOfThisWeek = LocalDate.now().with(java.time.temporal.TemporalAdjusters.previousOrSame(MONDAY));
        Instant startOfWeek = mondayOfThisWeek.atStartOfDay(ZoneId.systemDefault()).toInstant();

       List<Payment> weeklyPayments =
                paymentRepository.findAllByStatusAndCreatedAtAfter(PAID, startOfWeek);

        String[] daysOfWeek = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};
        for (int i = 0; i < 7; i++) {
            LocalDate targetDay = mondayOfThisWeek.plusDays(i);
            String dayLabel = daysOfWeek[i];

            List<Payment> targetDayPayments = weeklyPayments.stream()
                    .filter(p -> p.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate().equals(targetDay))
                    .collect(Collectors.toList());

            long sum = targetDayPayments.stream()
                    .mapToLong(p -> p.getAmount() != null ? p.getAmount() : 0L)
                    .sum();
            long salesCount = targetDayPayments.size();

            weeklyProfit.add(new AdminDashboardSummaryResponse.WeeklyProfitResponse(dayLabel, sum, salesCount));
        }

       
        long pendingCompanies = companyRepository.countByStatus(PENDING);
        long pendingComplaints = jobRepository.countByStatus(APPEALED);
        AdminDashboardSummaryResponse.AdminTodoResponse adminTodo =
                AdminDashboardSummaryResponse.AdminTodoResponse.builder()
                        .pendingCompanies(pendingCompanies)
                        .pendingComplaints(pendingComplaints)
                        .build();


     List<AdminDashboardSummaryResponse.PackageUsageResponse> topPackages = new ArrayList<>();
        try {
            List<Object[]> topSellingData = companySubscriptionRepository.findTopSellingPlans(
                  PageRequest.of(0, 5)
            );
            for (Object[] row : topSellingData) {
                String planName = (String) row[0];
                long salesCount = ((Number) row[1]).longValue();
                topPackages.add(new AdminDashboardSummaryResponse.PackageUsageResponse(planName, salesCount));
            }
        } catch (Exception e) {

        }
        List<AdminDashboardSummaryResponse.AIUsageResponse> aiUsage = new ArrayList<>();

        return AdminDashboardSummaryResponse.builder()
                .totalUsers(totalUsers)
                .newUsersToday(newUsersToday)
                .totalJobs(totalJobs)
                .newJobsToday(newJobsToday)
                .totalCompanies(totalCompanies)
                .newCompaniesToday(newCompaniesToday)
                .dailyVisits(dailyVisits)
                .systemActivities(systemActivities)
                .userDistribution(userDistribution)
                .revenueHistory(revenueHistory)
                .weeklyProfit(weeklyProfit)
                .adminTodo(adminTodo)
                .topPackages(topPackages)
                .aiUsage(aiUsage)
                .build();
    }
}
