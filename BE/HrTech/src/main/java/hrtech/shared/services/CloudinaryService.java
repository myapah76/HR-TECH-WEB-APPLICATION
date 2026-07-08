package hrtech.shared.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.system.abstractions.services.SystemConfigService;
import hrtech.system.entities.SystemConfig;

import hrtech.shared.dtos.CloudinarySignatureResponse;
import org.springframework.util.DigestUtils;
import java.io.InputStream;
import java.net.URI;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final SystemConfigService systemConfigService;

    public String checkValidUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL);
        }

        Pattern pattern = Pattern.compile(".*/(image|raw|video)/upload/(?:v\\d+/)?([^?#]+)$");
        Matcher matcher = pattern.matcher(url);

        if (!matcher.matches()) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL);
        }

        // Calculate true MD5 hash of the file bytes from Cloudinary URL
        try (InputStream is = new URI(url).toURL().openStream()) {
            return DigestUtils.md5DigestAsHex(is);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL, "Không thể đọc dữ liệu tệp từ Cloudinary");
        }
    }



    public CloudinarySignatureResponse generateUploadSignature(String folder) {
        SystemConfig config = systemConfigService.getSystemConfigEntity();
        long timestamp = System.currentTimeMillis() / 1000L;

        Map<String, Object> params = new HashMap<>();
        params.put("folder", folder);
        params.put("timestamp", timestamp);

        try {
            String signature = getDynamicCloudinary().apiSignRequest(params, config.getCloudinaryApiSecret());

            return CloudinarySignatureResponse.builder()
                    .signature(signature)
                    .timestamp(timestamp)
                    .apiKey(config.getCloudinaryApiKey())
                    .cloudName(config.getCloudinaryCloudName())
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.HAS_ERROR, "Lỗi khi tạo chữ ký Cloudinary: " + e.getMessage());
        }
    }

    private Cloudinary getDynamicCloudinary() {
        SystemConfig config = systemConfigService.getSystemConfigEntity();
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", config.getCloudinaryCloudName(),
                "api_key", config.getCloudinaryApiKey(),
                "api_secret", config.getCloudinaryApiSecret()));
    }
}
