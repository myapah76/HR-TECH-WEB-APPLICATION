package sba301.hrtech.cv.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.identity.abstractions.repositories.UserRepository;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.abstractions.services.CvService;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.shared.services.CloudinaryService;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;

import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.cv.mapper.CvMapper;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import java.util.stream.Collectors;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CvServiceImpl implements CvService {

    private final CvRepository cvRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final ISkillExtractionService skillExtractionService;
    private final AuthUtils authUtils;
    private final CvMapper cvMapper;

    @Override
    public CvSummaryResponse createCv(String title, MultipartFile file) {
        UUID userId = authUtils.getCurrentUserId();
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
                .extractionStatus(ExtractionStatus.PENDING)
                .isPrimary(isFirstCv)
                .build();

        Cv savedCv = cvRepository.save(newCv);

        // Trigger background task ONLY after the current transaction commits
        // to ensure the CV is actually present in the database when the background
        // thread runs.
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        skillExtractionService.extractAndSaveSkills(savedCv.getId());
                    }
                }
            );
        } else {
            skillExtractionService.extractAndSaveSkills(savedCv.getId());
        }

        return cvMapper.toSummaryResponse(savedCv);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CvSummaryResponse> getCvsByCurrentUser() {
        UUID userId = authUtils.getCurrentUserId();
        return cvRepository.findByUserId(userId).stream()
                .map(cvMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CvDetailResponse getCvById(UUID cvId) {
        UUID userId = authUtils.getCurrentUserId();
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "CV_NOT_FOUND",
                        "CV không tồn tại hoặc đã bị xóa"
                ));

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "CV_ACCESS_DENIED",
                    "Bạn không có quyền xem CV này!"
            );
        }

        return cvMapper.toDetailResponse(cv);
    }

    @Override
    public CvSummaryResponse setPrimaryCv(UUID cvId) {
        UUID userId = authUtils.getCurrentUserId();
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
        return cvMapper.toSummaryResponse(cvRepository.save(targetCv));
    }

    @Override
    public CvSummaryResponse updateCvTitle(UUID cvId, String newTitle) {
        UUID userId = authUtils.getCurrentUserId();
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

        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TITLE",
                    "Tên CV không được để trống!"
            );
        }

        targetCv.setTitle(newTitle.trim());
        return cvMapper.toSummaryResponse(cvRepository.save(targetCv));
    }

    @Override
    public void deleteCv(UUID cvId) {
        UUID userId = authUtils.getCurrentUserId();
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

        cvRepository.delete(cv);

        if (Boolean.TRUE.equals(cv.getIsPrimary())) {
            cvRepository.findByUserId(userId).stream()
                    .filter(c -> !c.getId().equals(cvId))
                    .findFirst()
                    .ifPresent(newPrimary -> {
                        newPrimary.setIsPrimary(true);
                        cvRepository.save(newPrimary);
                    });
        }
    }
}