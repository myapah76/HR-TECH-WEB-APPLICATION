package hrtech.job.services;

import hrtech.application.abstractions.services.IApplicationService;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.company.abstractions.services.ICompanyService;
import hrtech.job.abstractions.repositories.JobRepository;
import hrtech.job.abstractions.repositories.JobSkillRepository;
import hrtech.job.dtos.response.HotPositionResponse;
import hrtech.job.dtos.response.LandingStatsResponse;
import hrtech.job.dtos.response.TrendingSkillResponse;
import hrtech.job.entities.enums.JobStatus;
import hrtech.job.projections.PositionJobCountProjection;
import hrtech.job.projections.SkillJobCountProjection;
import hrtech.skill.abstractions.services.ISkillService;
import hrtech.skill.dtos.response.SkillResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class JobAnalyticsService {

    private final ISkillService skillService;
    private final ICompanyService companyService;

    @Autowired
    @Lazy
    private IApplicationService applicationService;

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;

    public List<TrendingSkillResponse> getTrendingSkills(int limit) {
        var rawTrending = jobSkillRepository.findTrendingSkills(
                JobStatus.APPROVED,
                PageRequest.of(0, limit));
        if (rawTrending.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> ids = rawTrending.stream()
                .map(SkillJobCountProjection::getSkillNeo4jId)
                .toList();

        List<SkillResponse> skillNodes = skillService.getSkillsByIds(ids);

        return rawTrending.stream().map(p -> {
            String name = skillNodes.stream()
                    .filter(node -> node.getId().equals(p.getSkillNeo4jId()))
                    .map(SkillResponse::getName)
                    .findFirst()
                    .orElse(p.getSkillNeo4jId());
            if (name != null && !name.isEmpty()) {
                name = name.substring(0, 1).toUpperCase() + name.substring(1);
            }
            return new TrendingSkillResponse(name, p.getJobCount());
        }).toList();
    }

    public List<HotPositionResponse> getHotPositions(int limit) {
        List<PositionJobCountProjection> results = jobRepository.findHotPositionsByStatus(
                JobStatus.APPROVED,
                PageRequest.of(0, limit));
        return results.stream()
                .filter(p -> p.getName() != null)
                .map(p -> new HotPositionResponse(p.getName(), p.getJobCount()))
                .toList();
    }

    public LandingStatsResponse getLandingStats() {
        long totalJobs = jobRepository.countByStatus(JobStatus.APPROVED);
        long totalCompanies = companyService.countApprovedCompanies();
        long totalApplications = applicationService.countApplicationsByStatus(ApplicationStatus.INTERVIEW);

        return new LandingStatsResponse(totalJobs, totalCompanies, totalApplications);
    }
}
