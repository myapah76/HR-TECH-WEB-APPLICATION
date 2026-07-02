package sba301.hrtech.system.dtos;

import lombok.Builder;
import java.util.UUID;

@Builder
public record SystemConfigResponse(
        UUID id,
        String websiteName,
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
        String payosChecksumKey,

        boolean dbOnline, // "Online" hoặc "Offline"
        String dbSize    // Đo trực tiếp dung lượng DB
) {}
