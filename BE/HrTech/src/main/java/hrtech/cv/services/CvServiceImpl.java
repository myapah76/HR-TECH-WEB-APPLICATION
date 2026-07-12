package hrtech.cv.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.cv.dtos.request.CreateCvRequest;
import hrtech.identity.entities.User;
import hrtech.cv.abstractions.repositories.CvRepository;
import hrtech.cv.abstractions.repositories.CvSkillRepository;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.cv.entities.CvSkill;
import hrtech.shared.enums.ExtractionStatus;
import java.time.Instant;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.shared.services.CloudinaryService;
import org.springframework.context.ApplicationEventPublisher;
import hrtech.shared.events.CvExtractionRequestedEvent;
import hrtech.identity.utils.AuthUtils;
import hrtech.cv.mapper.CvMapper;
import hrtech.cv.dtos.response.CvDetailResponse;
import hrtech.cv.dtos.response.CvSummaryResponse;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CvServiceImpl implements ICvService {

    private final CvRepository cvRepository;
    private final CvSkillRepository cvSkillRepository;
    private final CloudinaryService cloudinaryService;
    private final ApplicationEventPublisher eventPublisher;
    private final AuthUtils authUtils;
    private final CvMapper cvMapper;

    @Override
    public CvSummaryResponse createCv(CreateCvRequest request) {
        User user = authUtils.getCurrentUser();
        // Validate the file URL using CloudinaryService and get file hash (MD5)
        String fileHash = cloudinaryService.checkValidUrl(request.getFileUrl());

        // Check if CV with the same content hash already exists for this user (only
        // when fileHash is valid)
        if (fileHash != null && !fileHash.isBlank()) {
            Optional<Cv> duplicateCv = cvRepository.findByUserIdAndFileHash(user.getId(), fileHash);
            if (duplicateCv.isPresent()) {
                Cv existing = duplicateCv.get();
                Map<String, Object> errorData = Map.of(
                        "duplicateCvId", existing.getId(),
                        "title", existing.getTitle());
                throw new AppException(
                        ErrorCode.CV_ALREADY_EXISTS,
                        "Hồ sơ này đã được tải lên trước đó",
                        errorData);
            }
        }

        // Check if this is the first CV for the user
        boolean isFirstCv = cvRepository.findByUserId(user.getId()).isEmpty();

        Cv newCv = Cv.builder()
                .user(user)
                .title(request.getTitle())
                .fileUrl(request.getFileUrl())
                .fileHash(fileHash)
                .extractionStatus(ExtractionStatus.PENDING)
                .isPrimary(isFirstCv)
                .build();

        Cv savedCv = cvRepository.save(newCv);

        eventPublisher.publishEvent(new CvExtractionRequestedEvent(savedCv.getId()));

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
                        ErrorCode.CV_NOT_FOUND,
                        "CV không tồn tại hoặc đã bị xóa"));

        // RECRUITER (HR staff) có quyền xem CV của ứng viên để review đơn ứng tuyển
        boolean isRecruiter = authUtils.hasRole("RECRUITER");
        if (!isRecruiter && !cv.getUser().getId().equals(userId)) {
            throw new AppException(
                    ErrorCode.CV_ACCESS_DENIED,
                    "Bạn không có quyền xem CV này!");
        }

        return cvMapper.toDetailResponse(cv);
    }

    @Override
    public CvSummaryResponse setPrimaryCv(UUID cvId) {
        UUID userId = authUtils.getCurrentUserId();
        Cv targetCv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.CV_NOT_FOUND,
                        "Không tìm thấy CV với ID: " + cvId));

        if (!targetCv.getUser().getId().equals(userId)) {
            throw new AppException(
                    ErrorCode.CV_ACCESS_DENIED,
                    "CV này không thuộc quyền sở hữu của bạn!");
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
                        ErrorCode.CV_NOT_FOUND,
                        "Không tìm thấy CV với ID: " + cvId));

        if (!targetCv.getUser().getId().equals(userId)) {
            throw new AppException(
                    ErrorCode.CV_ACCESS_DENIED,
                    "CV này không thuộc quyền sở hữu của bạn!");
        }

        if (newTitle == null || newTitle.trim().isEmpty()) {
            throw new AppException(
                    ErrorCode.INVALID_INPUT,
                    "Tên CV không được để trống!");
        }

        targetCv.setTitle(newTitle.trim());
        return cvMapper.toSummaryResponse(cvRepository.save(targetCv));
    }

    @Override
    public void deleteCv(UUID cvId) {
        UUID userId = authUtils.getCurrentUserId();
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.CV_NOT_FOUND,
                        "Không tìm thấy CV để xóa"));

        if (!cv.getUser().getId().equals(userId)) {
            throw new AppException(
                    ErrorCode.CV_ACCESS_DENIED,
                    "Bạn không có quyền xóa CV này!");
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

    @Override
    public Cv getCvEntityById(UUID cvId) {
        return cvRepository.findById(cvId)
                .orElseThrow(() -> new AppException(ErrorCode.CV_NOT_FOUND));
    }

    @Override
    public List<Cv> findStuckCvs(List<ExtractionStatus> statuses, Instant threshold) {
        return cvRepository.findStuckCvs(statuses, threshold);
    }

    @Override
    @Transactional
    public Cv saveCvEntity(Cv cv) {
        return cvRepository.save(cv);
    }

    @Override
    @Transactional
    public void saveCvSkill(CvSkill cvSkill) {
        cvSkillRepository.save(cvSkill);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cv> findAllWithCompletedSkills() {
        return cvRepository.findAllWithCompletedSkills();
    }
}