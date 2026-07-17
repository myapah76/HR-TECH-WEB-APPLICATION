package hrtech.job.services;

import hrtech.job.dtos.request.ReviewJobPostingRequest;
import hrtech.job.dtos.response.ReviewJobPostingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobAiServiceClient {
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public ReviewJobPostingResponse reviewJobPosting(ReviewJobPostingRequest requestBody) {
        try {
            String url = aiServiceUrl + "/api/ai/review-job-posting";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ReviewJobPostingRequest> entity = new HttpEntity<>(requestBody, headers);
            log.info("Sending job posting review request to AI Service");
            ResponseEntity<ReviewJobPostingResponse> response = restTemplate.postForEntity(url, entity, ReviewJobPostingResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to review job posting from AI service, status: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("AI service review job posting error: {}", e.getMessage(), e);
        }
        return null;
    }
}
