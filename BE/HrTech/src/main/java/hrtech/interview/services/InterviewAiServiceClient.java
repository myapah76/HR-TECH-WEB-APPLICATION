package hrtech.interview.services;

import hrtech.interview.dtos.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewAiServiceClient {
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public List<String> generateInterviewQuestions(String cvText, String jdText, String targetRole,
            Integer numQuestions) {
        try {
            String url = aiServiceUrl + "/api/ai/generate-questions";
            var requestBody = GenerateQuestionsRequest.builder()
                    .cv_text(cvText != null ? cvText : "")
                    .jd_text(jdText != null ? jdText : "")
                    .target_role(targetRole)
                    .num_questions(numQuestions != null ? numQuestions : 5)
                    .build();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<List<String>>() {
                    });
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
        }
        return Collections.emptyList();
    }

    public EvaluateAnswerResponse evaluateAnswer(EvaluateAnswerRequest request) {
        String url = aiServiceUrl + "/api/ai/evaluate-answer";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(request, headers);
            ResponseEntity<EvaluateAnswerResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    EvaluateAnswerResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
        }
        return null;
    }

    public EvaluateSessionResponse evaluateInterviewSession(EvaluateSessionRequest request) {
        String url = aiServiceUrl + "/api/ai/evaluate-session";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(request, headers);
            ResponseEntity<EvaluateSessionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    EvaluateSessionResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
        }
        return null;
    }
}
