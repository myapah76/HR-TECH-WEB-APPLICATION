package sba301.hrtech.cv.services;

import sba301.hrtech.cv.entities.Cv;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CvService {
    Cv createCv(UUID userId, String title, String fileUrl);

    List<Cv> getCvsByUserId(UUID userId);

    Optional<Cv> getCvById(UUID cvId);

    Cv setPrimaryCv(UUID userId, UUID cvId);

    void deleteCv(UUID userId, UUID cvId);

    Cv updateAiParsedContent(UUID cvId, String jsonContent);
}