package hrtech.company.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.application.abstractions.repositories.ApplicationRepository;
import hrtech.company.abstractions.repositories.CompanyRepository;
import hrtech.company.abstractions.services.ICompanyDashboardService;
import hrtech.company.dtos.response.*;
import hrtech.company.entities.Company;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.entities.Job;
import hrtech.job.entities.enums.JobStatus;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyDashboardServiceImpl implements ICompanyDashboardService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final AuthUtils authUtils;

    private record CompanyContext(List<Job> jobs, List<Application> applications) {
    }

    private CompanyContext resolveCompanyContext() {
        User currentUser = authUtils.getCurrentUser();
        Company company = companyRepository.findCompanyByUserIdIncludingDeleted(currentUser.getId())
                .orElseThrow(
                        () -> new AppException(ErrorCode.COMPANY_NOT_FOUND, "You are not a member of any company."));
        if (company.isDeleted()) {
            throw new AppException(ErrorCode.COMPANY_BANNED, "Company has been deactivated or banned.");
        }
        List<Job> jobs = jobRepository.findByCompanyIdAndDeletedFalse(company.getId());
        List<UUID> jobIds = jobs.stream().map(Job::getId).toList();
        List<Application> applications = jobIds.isEmpty()
                ? new ArrayList<>()
                : applicationRepository.findByJobIdIn(jobIds);
        return new CompanyContext(jobs, applications);
    }

    @Override
    public RecruiterDashboardSummaryResponse getRecruiterDashboardSummary() {
        CompanyContext ctx = resolveCompanyContext();
        List<Job> jobs = ctx.jobs();
        List<Application> apps = ctx.applications();

        return RecruiterDashboardSummaryResponse.builder()
                .activeJobsCount(jobs.stream().filter(j -> j.getStatus() == JobStatus.APPROVED).count())
                .totalApps(apps.size())
                .submittedAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SUBMITTED).count())
                .screeningAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SCORED).count())
                .interviewAppsCount(apps.stream()
                        .filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW
                                || a.getStatus() == ApplicationStatus.PENDING_INTERVIEW_SCHEDULE)
                        .count())
                .offerAppsCount(apps.stream().filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED).count())
                .build();
    }

    @Override
    public List<RecruiterUpcomingInterviewResponse> getRecruiterUpcomingInterviews() {
        CompanyContext ctx = resolveCompanyContext();
        return ctx.applications().stream()
                .filter(a -> a.getInterviewDateTime() != null)
                .sorted(Comparator.comparing(Application::getInterviewDateTime))
                .limit(4)
                .map(a -> RecruiterUpcomingInterviewResponse.builder()
                        .cvTitle(a.getCv() != null ? a.getCv().getTitle() : "CV")
                        .jobTitle(a.getJob() != null ? a.getJob().getTitle() : "Vị trí tuyển dụng")
                        .interviewDateTime(a.getInterviewDateTime())
                        .status(a.getStatus().name())
                        .build())
                .toList();
    }

    @Override
    public List<RecruiterActiveJobResponse> getRecruiterActiveJobs() {
        CompanyContext ctx = resolveCompanyContext();
        List<Application> apps = ctx.applications();

        return ctx.jobs().stream()
                .filter(j -> j.getStatus() == JobStatus.APPROVED)
                .sorted(Comparator.comparing(Job::getCreatedAt).reversed())
                .limit(3)
                .map(j -> {
                    long appCount = apps.stream()
                            .filter(a -> a.getJob() != null && a.getJob().getId().equals(j.getId()))
                            .count();
                    return RecruiterActiveJobResponse.builder()
                            .id(j.getId())
                            .title(j.getTitle())
                            .location(j.getLocation())
                            .salaryMin(j.getSalaryMin())
                            .salaryMax(j.getSalaryMax())
                            .applicantCount(appCount)
                            .build();
                })
                .toList();
    }

    @Override
    public RecruiterAnalyticsResponse getRecruiterAnalytics() {
        CompanyContext ctx = resolveCompanyContext();
        List<Application> apps = ctx.applications();

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(zoneId);

        // ── 7 days ──────────────────────────────────────────────────────────────
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd/MM");
        List<RecruiterAnalyticsItem> sevenDays = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            ZonedDateTime day = now.minusDays(i);
            LocalDate targetDate = day.toLocalDate();
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> ZonedDateTime.ofInstant(a.getAppliedAt(), zoneId).toLocalDate().equals(targetDate))
                    .count();
            sevenDays.add(new RecruiterAnalyticsItem(day.format(dayFmt), count));
        }

        // ── 6 months ────────────────────────────────────────────────────────────
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MM/yyyy");
        List<RecruiterAnalyticsItem> sixMonths = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime month = now.minusMonths(i);
            int yr = month.getYear(), mo = month.getMonthValue();
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> {
                        ZonedDateTime d = ZonedDateTime.ofInstant(a.getAppliedAt(), zoneId);
                        return d.getYear() == yr && d.getMonthValue() == mo;
                    })
                    .count();
            sixMonths.add(new RecruiterAnalyticsItem("T" + month.format(monthFmt), count));
        }

        // ── 3 years ─────────────────────────────────────────────────────────────
        List<RecruiterAnalyticsItem> threeYears = new ArrayList<>();
        for (int i = 2; i >= 0; i--) {
            int year = now.getYear() - i;
            long count = apps.stream()
                    .filter(a -> a.getAppliedAt() != null)
                    .filter(a -> ZonedDateTime.ofInstant(a.getAppliedAt(), zoneId).getYear() == year)
                    .count();
            threeYears.add(new RecruiterAnalyticsItem(String.valueOf(year), count));
        }

        return RecruiterAnalyticsResponse.builder()
                .sevenDays(sevenDays)
                .sixMonths(sixMonths)
                .threeYears(threeYears)
                .build();
    }
}

