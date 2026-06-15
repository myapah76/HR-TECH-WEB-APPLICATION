package sba301.hrtech.cv.abstractions.services;

import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface CvService {
    CvSummaryResponse createCv(String title, MultipartFile file);
    List<CvSummaryResponse> getCvsByCurrentUser();
    CvDetailResponse getCvById(UUID cvId);
    CvSummaryResponse setPrimaryCv(UUID cvId);
    CvSummaryResponse updateCvTitle(UUID cvId, String newTitle);
    void deleteCv(UUID cvId);
}