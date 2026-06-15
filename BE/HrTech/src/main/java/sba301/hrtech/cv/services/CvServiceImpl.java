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
import sba301.hrtech.shared.error.ErrorCode;
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
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));


        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("application/pdf") &&
                        !contentType.startsWith("image/"))) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
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

        return savedCv;
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
                .orElseThrow(() -> new AppException(ErrorCode.CV_NOT_FOUND));

        if (!targetCv.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.CV_ACCESS_DENIED);
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
    public Cv updateCvTitle(UUID userId, UUID cvId, String newTitle) {
        Cv targetCv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(ErrorCode.CV_NOT_FOUND));

        if (!targetCv.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.CV_ACCESS_DENIED);
        }

        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_TITLE);
        }

        targetCv.setTitle(newTitle.trim());
        return cvRepository.save(targetCv);
    }

    @Override
    public void deleteCv(UUID userId, UUID cvId) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(ErrorCode.CV_NOT_FOUND));

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.CV_ACCESS_DENIED);
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