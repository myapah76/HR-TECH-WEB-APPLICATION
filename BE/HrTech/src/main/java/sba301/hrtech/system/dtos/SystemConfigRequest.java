package sba301.hrtech.system.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SystemConfigRequest(
        @NotBlank(message = "Tên website không được trống")
        String websiteName,
        @NotNull(message = "Dung lượng upload tối đa không được trống")
        Integer maxFileSize,

        String smtpHost,
        Integer smtpPort,
        String smtpUsername,
        String smtpPassword,
        String smtpFromEmail,

        Integer jwtAccessExpirationMinutes,
        Integer jwtRefreshTokenExpirationDays,
        String jwtIssuer,
        String jwtAudience,

        String cloudinaryCloudName,
        String cloudinaryApiKey,
        String cloudinaryApiSecret,

        String payosClientId,
        String payosApiKey,
        String payosChecksumKey
) {}
