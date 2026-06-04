package sba301.hrtech.cv.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.auth.entities.User;
import sba301.hrtech.auth.abstractions.repositories.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CvServiceImpl implements CvService {

    private final CvRepository cvRepository;
    private final UserRepository userRepository;

    public CvServiceImpl(CvRepository cvRepository, UserRepository userRepository) {
        this.cvRepository = cvRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Cv createCv(UUID userId, String title, String fileUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại với ID: " + userId));

        // Tối ưu: Dùng hàm custom trong repo để kiểm tra số lượng CV hiện có của ứng viên
        List<Cv> existingCvs = cvRepository.findByUserId(userId);
        boolean isFirstCv = existingCvs.isEmpty();

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
        // Tối ưu: Lấy trực tiếp danh sách CV dựa trên kết nối Id của User dưới DB
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CV với ID: " + cvId));

        if (!targetCv.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Hành vi bất hợp pháp! CV này không thuộc quyền sở hữu của bạn.");
        }

        // Tối ưu: Chỉ tìm duy nhất bản ghi Primary cũ để hạ quyền nhằm giảm thiểu chi phí quét bảng
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CV để xóa"));

        if (!cv.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa CV này!");
        }

        if (Boolean.TRUE.equals(cv.getIsPrimary())) {
            throw new IllegalStateException("Không thể xóa CV mặc định. Vui lòng chọn CV khác làm mặc định trước!");
        }

        cvRepository.delete(cv);
    }

    @Override
    public Cv updateAiParsedContent(UUID cvId, String jsonContent) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CV để cập nhật AI"));
        cv.setParsedContent(jsonContent);
        return cvRepository.save(cv);
    }
}