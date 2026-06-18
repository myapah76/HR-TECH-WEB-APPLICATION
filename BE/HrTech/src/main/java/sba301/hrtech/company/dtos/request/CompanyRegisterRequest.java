package sba301.hrtech.company.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.Email;

public record CompanyRegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        String phone,

        @NotBlank(message = "Company name is required")
        @Size(min = 3, max = 255, message = "Company name must be between 3 and 255 characters")
        String name,

        String description,

        String website,

        String industry,

        String size,

        String address,

        @NotBlank(message = "Tax code is required")
        String taxCode,

        @NotBlank(message = "Company logo is required")
        String logoUrl
) {}

