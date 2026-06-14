package sba301.hrtech.cv.abstractions.services;

import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.cv.entities.Cv;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CvService {
    Cv createCv(UUID userId, String title, MultipartFile file);
    List<Cv> getCvsByUserId(UUID userId);
    Optional<Cv> getCvById(UUID cvId);
    Cv setPrimaryCv(UUID userId, UUID cvId);
    Cv updateCvTitle(UUID userId, UUID cvId, String newTitle);
    void deleteCv(UUID userId, UUID cvId);
}