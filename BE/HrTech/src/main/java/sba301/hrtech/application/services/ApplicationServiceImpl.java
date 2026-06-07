package sba301.hrtech.application.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.application.abstractions.services.ApplicationService;
import sba301.hrtech.application.dtos.request.SubmitApplicationRequest;
import sba301.hrtech.application.dtos.response.ApplicationDetailResponse;
import sba301.hrtech.application.dtos.response.ApplicationSummaryResponse;
import sba301.hrtech.application.entities.enums.ApplicationStatus;

import java.util.List;
import java.util.UUID;
@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationServiceImpl  implements ApplicationService {
    @Override
    public ApplicationSummaryResponse submitApplication(UUID userId, SubmitApplicationRequest request) {
        return null;
    }

    @Override
    public List<ApplicationSummaryResponse> getMyApplications(UUID userId) {
        return List.of();
    }

    @Override
    public ApplicationDetailResponse getApplicationDetail(UUID userId, UUID applicationId) {
        return null;
    }

    @Override
    public void withdrawApplication(UUID userId, UUID applicationId) {

    }

    @Override
    public ApplicationSummaryResponse updateStatus(UUID applicationId, ApplicationStatus newStatus) {
        return null;
    }

    @Override
    public List<ApplicationSummaryResponse> getApplicationsByJob(UUID jobId) {
        return List.of();
    }
}
