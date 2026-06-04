package sba301.hrtech.company.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import sba301.hrtech.shared.exceptions.AppException;

@Service
public class TaxVerificationService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String verifyTaxCode(String taxCode) {
        String url = "https://api.vietqr.io/v2/business/" + taxCode;
        try {
            String response = restTemplate.getForObject(url, String.class);
            if (response == null) {
                throw new AppException(
                        HttpStatus.BAD_REQUEST,
                        "TAX_VERIFICATION_FAILED",
                        "No response from tax verification API."
                );
            }

            JsonNode root = objectMapper.readTree(response);
            String code = root.path("code").asText();
            if ("00".equals(code)) {
                JsonNode data = root.path("data");
                String name = data.path("name").asText();
                if (name == null || name.isBlank()) {
                     throw new AppException(
                            HttpStatus.BAD_REQUEST,
                            "TAX_VERIFICATION_FAILED",
                            "Tax code is valid but no company name was returned."
                    );
                }
                return name;
            } else {
                String desc = root.path("desc").asText("Invalid tax code.");
                throw new AppException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_TAX_CODE",
                        "Tax verification failed: " + desc
                );
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "TAX_VERIFICATION_ERROR",
                    "Error occurred during tax code verification: " + e.getMessage()
            );
        }
    }
}
