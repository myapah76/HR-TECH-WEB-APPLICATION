package sba301.hrtech.cv.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.abstractions.services.CvService;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.shared.services.CloudinaryService;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CvServiceImpl implements CvService {

    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final ISkillExtractionService skillExtractionService;

    @Override
    public Cv createCv(UUID userId, String title, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "Người dùng không tồn tại với ID: " + userId
                ));


        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("application/pdf") &&
                        !contentType.startsWith("image/"))) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_FILE_TYPE",
                    "Chỉ chấp nhận file PDF hoặc ảnh!"
            );
        }


        String fileUrl = cloudinaryService.uploadFile(file, "hrtech/cvs");


        boolean isFirstCv = cvRepository.findByUserId(userId).isEmpty();


        Cv newCv = Cv.builder()
                .user(user)
                .title(title)
                .fileUrl(fileUrl)
                .isPrimary(isFirstCv)
                .build();

        return cvRepository.save(newCv);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cv> getCvsByUserId(UUID userId) {
        return cvRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Cv> getCvById(UUID cvId) {
        return cvRepository.findById(cvId);
    }

    @Override
    public Cv setPrimaryCv(UUID userId, UUID cvId) {
        Cv targetCv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "CV_NOT_FOUND",
                        "Không tìm thấy CV với ID: " + cvId
                ));

        if (!targetCv.getUser().getId().equals(userId)) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "CV_ACCESS_DENIED",
                    "CV này không thuộc quyền sở hữu của bạn!"
            );
        }

        // Hạ primary CV cũ
        cvRepository.findByUserIdAndIsPrimaryTrue(userId)
                .ifPresent(oldPrimary -> {
                    oldPrimary.setIsPrimary(false);
                    cvRepository.save(oldPrimary);
                });

        targetCv.setIsPrimary(true);
        return cvRepository.save(targetCv);
    }

    @Override
    public void deleteCv(UUID userId, UUID cvId) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "CV_NOT_FOUND",
                        "Không tìm thấy CV để xóa"
                ));

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "CV_ACCESS_DENIED",
                    "Bạn không có quyền xóa CV này!"
            );
        }

        if (Boolean.TRUE.equals(cv.getIsPrimary())) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "CV_IS_PRIMARY",
                    "Không thể xóa CV mặc định. Vui lòng chọn CV khác làm mặc định trước!"
            );
        }

        cvRepository.delete(cv);
    }

    @Override
    public Cv updateAiParsedContent(UUID cvId, String jsonContent) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "CV_NOT_FOUND",
                        "Không tìm thấy CV để cập nhật AI"
                ));

        cv.setParsedContent(jsonContent);
        cv.setExtractionStatus(ExtractionStatus.PENDING);
        Cv savedCv = cvRepository.save(cv);

        skillExtractionService.extractAndSaveSkills(savedCv.getId());

        return savedCv;
    }
}