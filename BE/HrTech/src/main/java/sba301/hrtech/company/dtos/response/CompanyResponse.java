package sba301.hrtech.company.dtos.response;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String description,
        String logoUrl,
        String website,
        String industry,
        String size,
        String address,
        String taxCode,
        String businessLicenseUrl,
        String status,
        Instant createdAt,
        Instant updatedAt,
        Double graphWeight,
        Double embeddingWeight,
        Double synonymWeight,
        Double relatedWeight,
        Double childToParentWeight,
        Double parentToChildWeight
) {}

