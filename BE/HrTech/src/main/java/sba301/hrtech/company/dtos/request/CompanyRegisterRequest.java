package sba301.hrtech.company.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRegisterRequest(
        @NotBlank(message = "Company name is required")
        @Size(min = 3, max = 255, message = "Company name must be between 3 and 255 characters")
        String name,

        String description,

        String website,

        String industry,

        String size,

        String address
) {}

