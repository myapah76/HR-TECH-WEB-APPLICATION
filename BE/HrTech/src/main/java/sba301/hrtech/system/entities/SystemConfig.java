package sba301.hrtech.system.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import sba301.hrtech.shared.common.BaseEntity;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig extends BaseEntity {
    // --- CÀI ĐẶT CHUNG (General Settings) ---
    @Column(name = "website_name", nullable = false)
    private String websiteName;
    @Column(name = "max_file_size", nullable = false)
    private Integer maxFileSize; // Tính bằng MB
    // --- CẤU HÌNH SMTP EMAIL ---
    @Column(name = "smtp_host")
    private String smtpHost;
    @Column(name = "smtp_port")
    private Integer smtpPort;
    @Column(name = "smtp_username")
    private String smtpUsername;
    @Column(name = "smtp_password")
    private String smtpPassword;
    @Column(name = "smtp_from_email")
    private String smtpFromEmail;
    // --- CẤU HÌNH BẢO MẬT & JWT TOKEN ---
    @Column(name = "jwt_access_expiration_minutes")
    private Integer jwtAccessExpirationMinutes;
    @Column(name = "jwt_refresh_expiration_days")
    private Integer jwtRefreshTokenExpirationDays;
    @Column(name = "jwt_issuer")
    private String jwtIssuer;
    @Column(name = "jwt_audience")
    private String jwtAudience;
    // --- CẤU HÌNH LƯU TRỮ CLOUDINARY ---
    @Column(name = "cloudinary_cloud_name")
    private String cloudinaryCloudName;
    @Column(name = "cloudinary_api_key")
    private String cloudinaryApiKey;
    @Column(name = "cloudinary_api_secret")
    private String cloudinaryApiSecret;
    // --- CẤU HÌNH CỔNG THANH TOÁN PAYOS ---
    @Column(name = "payos_client_id")
    private String payosClientId;
    @Column(name = "payos_api_key")
    private String payosApiKey;
    @Column(name = "payos_checksum_key")
    private String payosChecksumKey;
}
