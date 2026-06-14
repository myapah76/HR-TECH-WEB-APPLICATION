package sba301.hrtech.company.dtos.request;

import jakarta.validation.constraints.Size;

public record CompanyUpdateRequest(
        @Size(min = 3, max = 255, message = "Company name must be between 3 and 255 characters")
        String name,
        String description,
        String logoUrl,
        String website,
        String industry,
        String size,
        String address,
        Double relatedWeight,
        Double childToParentWeight,
        Double parentToChildWeight
) {}

