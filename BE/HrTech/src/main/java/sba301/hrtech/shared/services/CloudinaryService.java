package sba301.hrtech.shared.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.system.abstractions.services.SystemConfigService;
import sba301.hrtech.system.entities.SystemConfig;

import sba301.hrtech.shared.dtos.CloudinarySignatureResponse;
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

        // Capture resource type (image, raw, video) as Group 1, and the file path as Group 2
        Pattern pattern = Pattern.compile(".*/(image|raw|video)/upload/(?:v\\d+/)?([^?#]+)$");
        Matcher matcher = pattern.matcher(url);

        if (!matcher.matches()) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL);
        }

        String resourceType = matcher.group(1);
        String publicId = getPublicId(matcher, resourceType);

        try {
            Cloudinary dynamicClient = getDynamicCloudinary();
            var apiResult = dynamicClient.api().resource(publicId, ObjectUtils.asMap("resource_type", resourceType));
            Object etagObj = apiResult.get("etag");
            return etagObj != null ? etagObj.toString() : null;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL);
        }
    }

    private String getPublicId(Matcher matcher, String resourceType) {
        String path = matcher.group(2);

        String publicId;
        if ("raw".equals(resourceType)) {
            // In Cloudinary, public IDs of 'raw' files include their extension (e.g. "cvs/my_cv.pdf")
            publicId = path;
        } else {
            // For 'image' and 'video', public IDs exclude the extension (e.g. "images/sample")
            int lastDotIdx = path.lastIndexOf('.');
            if (lastDotIdx != -1) {
                publicId = path.substring(0, lastDotIdx);
            } else {
                publicId = path;
            }
        }
        return publicId;
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
                "api_secret", config.getCloudinaryApiSecret()
        ));
    }
}
