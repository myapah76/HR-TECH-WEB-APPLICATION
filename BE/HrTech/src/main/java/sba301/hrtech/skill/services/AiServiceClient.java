package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import sba301.hrtech.skill.dtos.response.ExtractedJobSkillDto;
import sba301.hrtech.skill.dtos.response.ExtractedSkillDto;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    /**
     * Calls Python AI service to extract skills from CV text.
     */
    public List<ExtractedSkillDto> extractSkillsFromText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String url = aiServiceUrl + "/api/extract";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("cv_text", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending CV text (length: {}) to Python AI Service for skill extraction", text.length());
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            log.info("Received response from Python AI Service with status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, String>> skillsData = (List<Map<String, String>>) response.getBody().get("skills");
                if (skillsData != null) {
                    List<ExtractedSkillDto> result = new ArrayList<>();
                    for (Map<String, String> s : skillsData) {
                        result.add(new ExtractedSkillDto(s.get("name"), s.get("level")));
                    }
                    log.info("Successfully extracted {} skills from Python AI Service", result.size());
                    return result;
                }
            }
            log.error("Failed to extract skills from AI service");
        } catch (Exception e) {
            log.error("AI service extraction error: {}", e.getMessage(), e);
        }
        return Collections.emptyList();
    }

    /**
     * Calls Python AI service to extract skills from Job description and
     * requirements.
     */
    public List<ExtractedJobSkillDto> extractJobSkillsFromText(String description, String requirements) {
        if ((description == null || description.trim().isEmpty())
                && (requirements == null || requirements.trim().isEmpty())) {
            return Collections.emptyList();
        }

        try {
            String url = aiServiceUrl + "/api/extract-job";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("description", description != null ? description : "");
            requestBody.put("requirements", requirements != null ? requirements : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending Job text to Python AI Service for skill extraction");
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            log.info("Received response from Python AI Service with status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> skillsData = (List<Map<String, Object>>) response.getBody().get("skills");
                if (skillsData != null) {
                    List<ExtractedJobSkillDto> result = new ArrayList<>();
                    for (Map<String, Object> s : skillsData) {
                        result.add(new ExtractedJobSkillDto(
                                (String) s.get("name"),
                                (String) s.get("level"),
                                (Boolean) s.get("is_mandatory")));
                    }
                    log.info("Successfully extracted {} job skills from Python AI Service", result.size());
                    return result;
                }
            }
            log.error("Failed to extract job skills from AI service");
        } catch (Exception e) {
            log.error("AI service job extraction error: {}", e.getMessage(), e);
        }
        return Collections.emptyList();
    }

    /**
     * Calls Python AI service to get embeddings for multiple texts.
     */
    public List<List<Double>> generateEmbeddings(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String url = aiServiceUrl + "/api/embed";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("texts", texts);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending {} texts to Python AI Service for embedding generation", texts.size());
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            log.info("Received response from Python AI Service with status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<List<Double>> embeddings = (List<List<Double>>) response.getBody().get("embeddings");
                if (embeddings != null) {
                    log.info("Successfully received {} embeddings from Python AI Service", embeddings.size());
                    return embeddings;
                }
            }
            log.error("Failed to generate batch embeddings from AI service");
        } catch (Exception e) {
            log.error("AI service batch embedding error: {}", e.getMessage(), e);
        }
        return Collections.nCopies(texts.size(), Collections.emptyList());
    }

    /**
     * Calls Python AI service to get embedding for a single text.
     */
    public List<Double> generateEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<List<Double>> results = generateEmbeddings(List.of(text));
        if (results != null && !results.isEmpty() && !results.get(0).isEmpty()) {
            return results.get(0);
        }

        log.warn("Failed to generate single embedding for text: {}", text.substring(0, Math.min(50, text.length())));
        return Collections.emptyList();
    }

    /**
     * Check if AI service is available
     */
    public boolean isAvailable() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(aiServiceUrl + "/", Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("AI Microservice is not available: {}", e.getMessage());
            return false;
        }
    }
}
