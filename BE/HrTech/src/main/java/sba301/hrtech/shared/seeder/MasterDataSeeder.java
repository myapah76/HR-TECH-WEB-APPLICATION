package sba301.hrtech.shared.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import sba301.hrtech.company.abstractions.repositories.CompanyRepository;
import sba301.hrtech.company.entities.Company;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.dtos.user.CustomUserDetails;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.abstractions.services.ISavedJobService;
import sba301.hrtech.job.dtos.request.JobRequest;
import sba301.hrtech.job.dtos.response.JobResponse;
import sba301.hrtech.subscription.abstractions.services.ISubscriptionService;
import sba301.hrtech.subscription.entities.enums.SubscriptionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class MasterDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final IJobService jobService;
    private final ISavedJobService savedJobService;
    private final ISubscriptionService subscriptionService;

    @Override
    public void run(String... args) throws Exception {
        if (jobRepository.count() > 0) {
            log.info("Jobs already seeded. Skipping MasterDataSeeder.");
            return;
        }

        log.info("Starting MasterDataSeeder...");

        // 1. Get Users
        Optional<User> hrUserOpt = userRepository.findByEmail("hr1@hrtech.com");
        Optional<User> hrUser2Opt = userRepository.findByEmail("hr2@hrtech.com");
        Optional<User> hrmgrOpt = userRepository.findByEmail("hrmgr1@hrtech.com");
        Optional<User> hrmgr2Opt = userRepository.findByEmail("hrmgr2@hrtech.com");
        Optional<User> candidateOpt = userRepository.findByEmail("candidate1@hrtech.com");
        Optional<User> candidate2Opt = userRepository.findByEmail("candidate2@hrtech.com");
        Optional<User> owner1Opt = userRepository.findByEmail("owner1@hrtech.com");
        Optional<User> owner2Opt = userRepository.findByEmail("owner2@hrtech.com");

        if (hrUserOpt.isEmpty() || hrUser2Opt.isEmpty() || hrmgrOpt.isEmpty() || hrmgr2Opt.isEmpty()
                || candidateOpt.isEmpty()) {
            log.warn("Required users not found. Please ensure users are seeded first.");
            return;
        }

        User hrUser = hrUserOpt.get();
        User hrUser2 = hrUser2Opt.get();
        User hrmgr = hrmgrOpt.get();
        User hrmgr2 = hrmgr2Opt.get();
        User candidate = candidateOpt.get();
        User candidate2 = candidate2Opt.orElse(null);
        User owner1 = owner1Opt.orElse(null);
        User owner2 = owner2Opt.orElse(null);

        List<Company> companies = companyRepository.findAll();
        if (companies.isEmpty()) {
            log.warn("No company found. Skipping job seeding.");
            return;
        }
        Company company1 = companies.get(0);
        Company company2 = companies.size() > 1 ? companies.get(1) : company1;

        // Auto-subscribe users/companies to Free plans (correct registration flow)
        subscriptionService.createAndActivateFreeSubscription(candidate.getId());
        if (candidate2 != null) {
            subscriptionService.createAndActivateFreeSubscription(candidate2.getId());
        }
        if (owner1 != null) {
            subscriptionService.createAndActivateFreeCompanySubscription(company1.getId(), owner1.getId());
        }
        if (owner2 != null) {
            subscriptionService.createAndActivateFreeCompanySubscription(company2.getId(), owner2.getId());
        }

        // Upgrade candidate1 to Cao Cấp
        subscriptionService.createAndActivateSubscription(candidate.getId(),
                UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff"), SubscriptionType.CANDIDATE);

        // Upgrade companies to Chuyên Nghiệp
        if (owner1 != null) {
            subscriptionService.createAndActivateSubscription(owner1.getId(),
                    UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"), SubscriptionType.COMPANY);
        }
        if (owner2 != null) {
            subscriptionService.createAndActivateSubscription(owner2.getId(),
                    UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"), SubscriptionType.COMPANY);
        }

        // Refresh references after balances are added to DB
        company1 = companyRepository.findById(company1.getId()).get();
        company2 = companyRepository.findById(company2.getId()).get();
        candidate = userRepository.findById(candidate.getId()).get();

        // 2. Seed Jobs (Mock HR)

        List<JobRequest> mockJobs1 = Arrays.asList(
            createJobRequest("Frontend Developer", "React, Javascript, HTML, CSS", company1.getId(), 15000000, 25000000),
            createJobRequest("Backend Developer", "Java, Spring Boot, MySQL, REST API", company1.getId(), 18000000, 35000000),
            createJobRequest("Fullstack Developer", "Node.js, React, MongoDB, Express", company1.getId(), 20000000, 45000000),
            createJobRequest("Mobile App Developer", "Flutter, Dart, Firebase, iOS, Android", company1.getId(), 15000000, 30000000),
            createJobRequest("DevOps Engineer", "Docker, Kubernetes, AWS, CI/CD", company1.getId(), 25000000, 50000000),
            createJobRequest("Data Analyst", "Python, SQL, Tableau, Excel", company1.getId(), 12000000, 22000000),
            createJobRequest("QA Engineer", "Selenium, Cypress, Testing, Automation", company1.getId(), 10000000, 20000000),
            createJobRequest("UI/UX Designer", "Figma, Sketch, Adobe XD, Design", company1.getId(), 12000000, 25000000),
            createJobRequest("System Administrator", "Linux, Networking, Bash, Windows Server", company1.getId(), 10000000, 18000000),
            createJobRequest("AI Engineer", "Python, TensorFlow, PyTorch, Machine Learning", company1.getId(), 30000000, 70000000));

        List<JobRequest> mockJobs2 = Arrays.asList(
            createJobRequest("Senior iOS Developer", "Swift, Objective-C, iOS, Xcode", company2.getId(), 35000000, 60000000),
            createJobRequest("Android Developer", "Kotlin, Java, Android Studio, Mobile", company2.getId(), 15000000, 28000000),
            createJobRequest("Backend Engineer", "Golang, PostgreSQL, Redis, Microservices", company2.getId(), 20000000, 40000000),
            createJobRequest("Frontend Engineer", "Vue.js, Javascript, Tailwind, CSS", company2.getId(), 12000000, 22000000),
            createJobRequest("Cloud Architect", "Azure, AWS, Architecture, System Design", company2.getId(), 45000000, 90000000),
            createJobRequest("Machine Learning Engineer", "Python, Scikit-Learn, Keras, Data Science", company2.getId(), 35000000, 65000000),
            createJobRequest("Database Administrator", "Oracle, SQL Server, MySQL, Performance Tuning", company2.getId(), 18000000, 32000000),
            createJobRequest("Security Engineer", "Cybersecurity, Penetration Testing, OWASP", company2.getId(), 22000000, 45000000),
            createJobRequest("Product Manager", "Agile, Scrum, Leadership, Product Strategy", company2.getId(), 25000000, 50000000),
            createJobRequest("Data Scientist", "Python, Rlang, Statistics, Data Mining", company2.getId(), 30000000, 60000000));

        List<UUID> createdJobIds1 = new ArrayList<>();
        List<UUID> createdJobIds2 = new ArrayList<>();

        // Create Company 1 jobs
        mockSecurityContext(hrUser);
        for (JobRequest request : mockJobs1) {
            JobResponse job = jobService.createJob(request);
            jobService.submitJob(job.id());
            createdJobIds1.add(job.id());
        }

        // Create Company 2 jobs
        mockSecurityContext(hrUser2);
        for (JobRequest request : mockJobs2) {
            JobResponse job = jobService.createJob(request);
            jobService.submitJob(job.id());
            createdJobIds2.add(job.id());
        }

        // Approve Jobs
        mockSecurityContext(hrmgr);
        for (UUID jobId : createdJobIds1) {
            jobService.approveJob(jobId);
            Thread.sleep(4500); // Rate limit to prevent Gemini API 429
        }

        mockSecurityContext(hrmgr2);
        for (UUID jobId : createdJobIds2) {
            jobService.approveJob(jobId);
            Thread.sleep(4500); // Rate limit to prevent Gemini API 429
        }
        log.info("Seeded 20 Jobs and triggered AI Extraction.");

        // 3. Seed Saved Job
        mockSecurityContext(candidate);
        if (!createdJobIds1.isEmpty()) {
            savedJobService.saveJob(createdJobIds1.get(0));
            log.info("Seeded 1 Saved Job.");
        }

        // Clear mock context
        SecurityContextHolder.clearContext();
        log.info("MasterDataSeeder completed successfully.");
    }

    private JobRequest createJobRequest(String title, String skills, UUID companyId, long salaryMin, long salaryMax) {
        return new JobRequest(
                companyId,
                title,
                "Looking for a highly skilled " + title,
                "Ho Chi Minh City",
                BigDecimal.valueOf(salaryMin),
                BigDecimal.valueOf(salaryMax),
                "FULL_TIME",
                "MIDDLE",
                Instant.now().plus(30, ChronoUnit.DAYS),
                "Must have experience with: " + skills,
                new ArrayList<>());
    }

    private void mockSecurityContext(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
