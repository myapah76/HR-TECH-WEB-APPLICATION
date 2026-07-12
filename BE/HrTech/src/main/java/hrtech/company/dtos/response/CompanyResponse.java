package hrtech.company.dtos.response;

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
        String status,
        Boolean isDeleted,
        Instant createdAt,
        Instant updatedAt,
        Double relatedWeight,
        Double parentOfWeight
) {}

