package sba301.hrtech.shared.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_FILE, "Uploaded file is empty.");
        }

        try {
            Map<?, ?> options = ObjectUtils.asMap(
                    "folder", folderName,
                    "resource_type", "auto"
            );
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new AppException(
                    ErrorCode.FILE_UPLOAD_FAILED,
                    "Failed to upload file to Cloudinary: " + e.getMessage()
            );
        }
    }

    public void checkValidUrl(String url) {
        Pattern pattern = Pattern.compile(".*/(?:image|raw|video)/upload/(?:v\\d+/)?(.+)\\.[^.]+$");
        Matcher matcher = pattern.matcher(url);

        if (!matcher.matches()) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL);
        }
        String publicId = matcher.group(1);
        try {
            cloudinary.api().resource(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CLOUDINARY_URL);
        }
    }
}
