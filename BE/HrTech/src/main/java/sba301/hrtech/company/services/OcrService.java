package sba301.hrtech.company.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.shared.exceptions.AppException;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class OcrService {

    @Value("${ocr.space.api-key:helloworld}")
    private String apiKey;

    private static final String OCR_API_URL = "https://api.ocr.space/parse/image";
    private static final Pattern TAX_CODE_PATTERN = Pattern.compile("\\b\\d{10,13}\\b");

    public String extractTaxCode(MultipartFile file) {
        String text = performOcr(file);

        if (text == null || text.isBlank() || text.contains("Không tìm thấy văn bản")) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "OCR_EXTRACTION_FAILED",
                    "Không thể trích xuất văn bản từ tài liệu đã tải lên. Vui lòng tải lên hình ảnh hoặc tệp PDF rõ nét hơn."
            );
        }

        Matcher matcher = TAX_CODE_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }

        throw new AppException(
                HttpStatus.BAD_REQUEST,
                "TAX_CODE_NOT_FOUND",
                "Không tìm thấy mã số thuế hợp lệ (10-13 chữ số) trong tài liệu đã tải lên. Vui lòng tải lên giấy phép kinh doanh chính xác."
        );
    }

    private String performOcr(MultipartFile file) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Wrap file bytes in ByteArrayResource with filename to send as file part
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "temp.png";
                }
            };
            
            body.add("file", fileResource);
            body.add("language", "vnm");
            body.add("isOverlayRequired", "false");
            body.add("OCREngine", "2");

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", apiKey);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(OCR_API_URL, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());
                
                // Check if API returned an error field
                JsonNode isErrored = root.path("IsErroredOnProcessing");
                if (isErrored.asBoolean()) {
                    String errorMsg = root.path("ErrorMessage").asText();
                    log.error("OCR.space API error: {}", errorMsg);
                    throw new AppException(HttpStatus.BAD_REQUEST, "OCR_PROCESSING_ERROR", errorMsg);
                }

                JsonNode parsedResults = root.path("ParsedResults");
                if (parsedResults.isArray() && !parsedResults.isEmpty()) {
                    return parsedResults.get(0).path("ParsedText").asText();
                } else {
                    return "Không tìm thấy văn bản trong ảnh.";
                }
            } else {
                log.error("OCR API connection failed with status: {}", response.getStatusCode());
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_API_FAILURE", "OCR API status: " + response.getStatusCode());
            }

        } catch (IOException e) {
            log.error("Failed to read upload file bytes", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_PROCESSING_ERROR", "Error reading file content: " + e.getMessage());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error performing OCR via OCR.space", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_API_FAILURE", "OCR.space API error: " + e.getMessage());
        }
    }
}
