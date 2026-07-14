package hrtech.candidate.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.candidate.abstractions.services.CandidateService;
import hrtech.candidate.dtos.CandidateDashboardSummaryResponse;
import hrtech.candidate.dtos.RecentActivityResponse;
import hrtech.application.abstractions.services.ApplicationService;
import hrtech.application.entities.Application;
import hrtech.application.entities.enums.ApplicationStatus;
import hrtech.job.abstractions.services.ISavedJobService;
import hrtech.job.entities.SavedJob;
import hrtech.cv.abstractions.services.ICvService;

import hrtech.candidate.dtos.UpcomingInterviewResponse;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidateServiceImpl implements CandidateService {

    private final ApplicationService applicationService;
    private final ISavedJobService savedJobService;
    private final ICvService cvService;

    @Override
    public CandidateDashboardSummaryResponse getCandidateDashboardSummary(UUID userId) {
        long appliedCount = applicationService.countApplicationsByUserId(userId);
        long savedCount = savedJobService.countSavedJobsByUserId(userId);
        long cvCount = cvService.countCvsByUserId(userId);
        long interviewCount = applicationService.countApplicationsByUserIdAndStatus(userId,
                ApplicationStatus.INTERVIEW);

        return CandidateDashboardSummaryResponse.builder()
                .appliedCount(appliedCount)
                .savedCount(savedCount)
                .cvCount(cvCount)
                .interviewCount(interviewCount)
                .build();
    }

    @Override
    public List<RecentActivityResponse> getRecentActivities(UUID userId, int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();

        // Recent applications
        List<Application> recentApplications = applicationService.getRecentApplications(userId, limit);
        for (Application app : recentApplications) {
            String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí không xác định";
            activities.add(RecentActivityResponse.builder()
                    .action("Ứng tuyển vị trí " + jobTitle)
                    .date(app.getAppliedAt())
                    .status("submitted")
                    .build());
        }

        // Recent saved jobs
        List<SavedJob> recentSavedJobs = savedJobService.getRecentSavedJobs(userId, limit);
        for (SavedJob savedJob : recentSavedJobs) {
            String jobTitle = savedJob.getJob() != null ? savedJob.getJob().getTitle() : "Việc làm";
            String companyName = (savedJob.getJob() != null && savedJob.getJob().getCompany() != null)
                    ? savedJob.getJob().getCompany().getName()
                    : "Nhà tuyển dụng";
            activities.add(RecentActivityResponse.builder()
                    .action("Lưu việc làm: " + jobTitle + " tại " + companyName)
                    .date(savedJob.getCreatedAt())
                    .status("saved")
                    .build());
        }

        // Sort by date descending and return top limit
        activities.sort(Comparator.comparing(RecentActivityResponse::getDate).reversed());
        return activities.stream().limit(limit).toList();
    }

    @Override
    public List<UpcomingInterviewResponse> getUpcomingInterviews(UUID userId) {

        List<Application> interviews = applicationService.getUpcomingInterviews(userId);

        return interviews.stream().map(app -> {

            String companyName = (app.getJob() != null && app.getJob().getCompany() != null)
                    ? app.getJob().getCompany().getName()
                    : "Nhà tuyển dụng";
            String jobTitle = app.getJob() != null ? app.getJob().getTitle() : "Vị trí không xác định";

            return UpcomingInterviewResponse.builder()
                    .company(companyName)
                    .position(jobTitle)
                    .dateTime(app.getInterviewDateTime())
                    .meetUrl(app.getInterviewMeetingLink())
                    .location(app.getInterviewLocation())
                    .applicationId(app.getId())
                    .build();
        }).toList();
    }
}
