package sba301.hrtech.skill.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import sba301.hrtech.chat.dtos.response.RagChatResponseDto;
import sba301.hrtech.skill.dtos.response.AiMatchingAdviceResponseDto;
import sba301.hrtech.skill.dtos.response.ParseExtractResponseDto;
import sba301.hrtech.skill.dtos.response.JobExtractResponseDto;
import sba301.hrtech.skill.dtos.response.MapRelationshipsResponseDto;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    /**
     * Calls Python AI service to download, parse, and extract skills from a CV URL.
     */
    public ParseExtractResponseDto parseAndExtractCv(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            return null;
        }

        try {
            String url = aiServiceUrl + "/api/parse-and-extract";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("file_url", fileUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending CV fileUrl ({}) to Python AI Service for parsing and extraction", fileUrl);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<ParseExtractResponseDto> response = restTemplate.postForEntity(url, entity,
                    ParseExtractResponseDto.class);
            log.info("Received response from Python AI Service with status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to parse and extract skills from AI service");
        } catch (Exception e) {
            log.error("AI service parse/extract error: {}", e.getMessage(), e);
        }
        return null;
    }

    /**
     * Calls Python AI service to extract skills from Job description and
     * requirements.
     */
    public JobExtractResponseDto extractJobSkillsFromText(String description, String requirements) {
        if ((description == null || description.trim().isEmpty())
                && (requirements == null || requirements.trim().isEmpty())) {
            return null;
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
            ResponseEntity<JobExtractResponseDto> response = restTemplate.postForEntity(url, entity,
                    JobExtractResponseDto.class);
            log.info("Received response from Python AI Service with status: {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to extract job skills from AI service");
        } catch (Exception e) {
            log.error("AI service job extraction error: {}", e.getMessage(), e);
        }
        return null;
    }

    /**
     * Calls Python AI service to map relationships between new skills and DB
     * skills.
     */
    public MapRelationshipsResponseDto mapRelationships(List<String> newSkills, List<String> dbSkills) {
        if (newSkills == null || newSkills.isEmpty() || dbSkills == null || dbSkills.isEmpty()) {
            return null;
        }

        try {
            String url = aiServiceUrl + "/api/map-relationships";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("new_skills", newSkills);
            requestBody.put("db_skills", dbSkills);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending {} new skills and {} db skills to AI Service for relationship mapping",
                    newSkills.size(), dbSkills.size());
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<MapRelationshipsResponseDto> response = restTemplate.postForEntity(url, entity,
                    MapRelationshipsResponseDto.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Successfully mapped relationships");
                return response.getBody();
            }
            log.error("Failed to map relationships from AI service, status: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("AI service map relationships error: {}", e.getMessage(), e);
        }
        return null;
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

    /**
     * Calls Python AI service to index a document for RAG.
     */
    public boolean indexDocument(String documentId, String text, Map<String, Object> metadata) {
        if (documentId == null || text == null || text.trim().isEmpty()) {
            return false;
        }

        try {
            String url = aiServiceUrl + "/api/rag/index";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("document_id", documentId);
            requestBody.put("text", text);
            requestBody.put("metadata", metadata != null ? metadata : new HashMap<>());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending document {} to Python AI Service for RAG indexing", documentId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully indexed document {} in RAG", documentId);
                return true;
            }
            log.error("Failed to index document in RAG, status: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("AI service RAG indexing error: {}", e.getMessage(), e);
        }
        return false;
    }

    /**
     * Calls Python AI service to chat using RAG.
     */
    public RagChatResponseDto chatWithRag(String query, List<String> documentIds, int topK) {
        if (query == null || query.trim().isEmpty()) {
            return null;
        }

        try {
            String url = aiServiceUrl + "/api/rag/chat";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            if (documentIds != null && !documentIds.isEmpty()) {
                requestBody.put("document_ids", documentIds);
            }
            requestBody.put("top_k", topK);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending chat query to Python AI Service RAG");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<RagChatResponseDto> response = restTemplate.postForEntity(url, entity,
                    RagChatResponseDto.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to chat with RAG, status: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("AI service RAG chat error: {}", e.getMessage(), e);
        }
        return null;
    }

    public sba301.hrtech.skill.dtos.response.AiMatchingAdviceResponseDto getMatchingAdvice(String cvText, String jdText, List<String> missingSkills) {
        if (missingSkills == null || missingSkills.isEmpty()) {
            return null; // Không cần lời khuyên nếu không thiếu kỹ năng
        }
        try {
            String url = aiServiceUrl + "/api/ai/candidate-matching-advice";
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("cv_text", cvText != null ? cvText : "");
            requestBody.put("jd_text", jdText != null ? jdText : "");
            requestBody.put("missing_skills", missingSkills);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            log.info("Sending candidate matching advice request to AI Service for {} missing skills", missingSkills.size());
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<AiMatchingAdviceResponseDto> response = restTemplate.postForEntity(
                    url, entity, AiMatchingAdviceResponseDto.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            log.error("Failed to get matching advice, status: {}", response.getStatusCode());
        } catch (Exception e) {
            log.error("AI service get matching advice error: {}", e.getMessage(), e);
        }
        return null;
    }
}
