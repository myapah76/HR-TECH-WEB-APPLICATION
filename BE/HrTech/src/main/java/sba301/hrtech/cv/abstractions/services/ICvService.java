package sba301.hrtech.cv.abstractions.services;

import sba301.hrtech.cv.dtos.request.CreateCvRequest;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.entities.CvSkill;
import sba301.hrtech.shared.enums.ExtractionStatus;
import java.time.Instant;

import java.util.List;
import java.util.UUID;

public interface ICvService {
    CvSummaryResponse createCv(CreateCvRequest request);
    List<CvSummaryResponse> getCvsByCurrentUser();
    CvDetailResponse getCvById(UUID cvId);
    CvSummaryResponse setPrimaryCv(UUID cvId);
    CvSummaryResponse updateCvTitle(UUID cvId, String newTitle);
    void deleteCv(UUID cvId);

    Cv getCvEntityById(UUID cvId);
    List<Cv> findStuckCvs(List<ExtractionStatus> statuses, Instant threshold);
    Cv saveCvEntity(Cv cv);
    void saveCvSkill(CvSkill cvSkill);
}