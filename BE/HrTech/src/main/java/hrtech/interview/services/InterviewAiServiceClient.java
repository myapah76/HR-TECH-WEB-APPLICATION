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

    // Gọi Python AI service để sinh câu hỏi phỏng vấn dựa trên CV, JD và vai trò
    // mục tiêu
    public List<String> generateInterviewQuestions(String cvText, String jdText, String targetRole) {
        try {
            // Gọi endpoint của Python AI service để sinh câu hỏi
            String url = aiServiceUrl + "/api/ai/generate-questions";
            // Tạo request body với dữ liệu CV, JD và vai trò mục tiêu
            var requestBody = GenerateQuestionsRequest.builder()
                    .cv_text(cvText != null ? cvText : "")
                    .jd_text(jdText != null ? jdText : "")
                    .target_role(targetRole)
                    .build();
            // Thiết lập headers cho request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // Tạo HttpEntity với request body và headers
            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
            // Gửi request POST đến Python AI service và nhận response
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<List<String>>() {
                    });
            // Kiểm tra nếu response thành công và có body, trả về danh sách câu hỏi
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
        }
        // Nếu có lỗi hoặc không nhận được câu hỏi, trả về danh sách rỗng
        return Collections.emptyList();
    }

    public EvaluateAnswerResponse evaluateAnswer(EvaluateAnswerRequest request) {
        String url = aiServiceUrl + "/api/ai/evaluate-answer";
        try {
            // Thiết lập headers cho request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // Tạo HttpEntity với request body và headers
            HttpEntity<Object> entity = new HttpEntity<>(request, headers);
            // Gửi request POST đến Python AI service và nhận response
            ResponseEntity<EvaluateAnswerResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    EvaluateAnswerResponse.class);
            // Kiểm tra nếu response thành công và có body, trả về kết quả đánh giá
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
        }
        return null;
    }

    // Gọi Python AI service để đánh giá buổi phỏng vấn dựa trên CV, JD và lịch sử
    // Q&A
    public EvaluateSessionResponse evaluateInterviewSession(EvaluateSessionRequest request) {
        String url = aiServiceUrl + "/api/ai/evaluate-session";
        try {
            // Thiết lập headers cho request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // Tạo HttpEntity với request body và headers
            HttpEntity<Object> entity = new HttpEntity<>(request, headers);
            // Gửi request POST đến Python AI service và nhận response
            ResponseEntity<EvaluateSessionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    EvaluateSessionResponse.class);
            // Kiểm tra nếu response thành công và có body, trả về kết quả đánh giá
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
        }
        // Nếu có lỗi hoặc không nhận được kết quả đánh giá, trả về null
        return null;
    }
}
