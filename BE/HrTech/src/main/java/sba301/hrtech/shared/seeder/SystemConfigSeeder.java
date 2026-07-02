package sba301.hrtech.shared.seeder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import sba301.hrtech.system.abstractions.repositories.SystemConfigRepository;
import sba301.hrtech.system.entities.SystemConfig;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class SystemConfigSeeder implements CommandLineRunner {

    private final SystemConfigRepository systemConfigRepository;

    // --- Đọc các thông số mặc định từ file properties ---
    @Value("${spring.mail.host:smtp.gmail.com}")
    private String defaultSmtpHost;

    @Value("${spring.mail.port:587}")
    private Integer defaultSmtpPort;

    @Value("${spring.mail.username:}")
    private String defaultSmtpUsername;

    @Value("${spring.mail.password:}")
    private String defaultSmtpPassword;

    @Value("${spring.mail.from:}")
    private String defaultSmtpFrom;

    @Value("${jwt.access-expiration:60}")
    private Integer defaultJwtAccessExp;

    @Value("${jwt.refresh-expiration:30}")
    private Integer defaultJwtRefreshExp;

    @Value("${jwt.issuer:hrtech}")
    private String defaultJwtIssuer;

    @Value("${jwt.audience:hrtech}")
    private String defaultJwtAudience;

    @Value("${cloudinary.cloud-name:}")
    private String defaultCloudinaryName;

    @Value("${cloudinary.api-key:}")
    private String defaultCloudinaryApiKey;

    @Value("${cloudinary.api-secret:}")
    private String defaultCloudinaryApiSecret;

    @Value("${payos.client-id:}")
    private String defaultPayosClientId;

    @Value("${payos.api-key:}")
    private String defaultPayosApiKey;

    @Value("${payos.checksum-key:}")
    private String defaultPayosChecksumKey;

    @Override
    public void run(String... args) throws Exception {
        if (systemConfigRepository.count() > 0) {
            log.info("System configuration already seeded. Skipping SystemConfigSeeder.");
            return;
        }

        log.info("Initializing default system configurations to database...");

        SystemConfig defaultConfig = SystemConfig.builder()
                .websiteName("HR-Tech")
                .maxFileSize(10)
                .smtpHost(defaultSmtpHost)
                .smtpPort(defaultSmtpPort)
                .smtpUsername(defaultSmtpUsername)
                .smtpPassword(defaultSmtpPassword)
                .smtpFromEmail(defaultSmtpFrom)
                .jwtAccessExpirationMinutes(defaultJwtAccessExp)
                .jwtRefreshTokenExpirationDays(defaultJwtRefreshExp)
                .jwtIssuer(defaultJwtIssuer)
                .jwtAudience(defaultJwtAudience)
                .cloudinaryCloudName(defaultCloudinaryName)
                .cloudinaryApiKey(defaultCloudinaryApiKey)
                .cloudinaryApiSecret(defaultCloudinaryApiSecret)
                .payosClientId(defaultPayosClientId)
                .payosApiKey(defaultPayosApiKey)
                .payosChecksumKey(defaultPayosChecksumKey)
                .build();

        systemConfigRepository.save(defaultConfig);
        log.info("Default system configuration seeded successfully.");
    }
}

