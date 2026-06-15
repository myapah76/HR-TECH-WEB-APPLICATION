package sba301.hrtech.subscription.dtos.feature.request;

import jakarta.validation.constraints.NotBlank;

public record CreateFeatureRequest(
        @NotBlank(message = "Code is required")
        String code,
        @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Description is required")
        String description
) {
}
