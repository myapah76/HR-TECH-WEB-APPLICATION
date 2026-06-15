package sba301.hrtech.cv.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.cv.dtos.request.CreateCvRequest;
import sba301.hrtech.cv.dtos.request.UpdateCvTitleRequest;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.mapper.CvMapper;
import sba301.hrtech.cv.abstractions.services.CvService;
import sba301.hrtech.shared.common.ApiResponse;
import sba301.hrtech.shared.exceptions.AppException;

import java.net.URI;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/cvs")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;
    private final CvMapper cvMapper;
    private final AuthUtils authUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CvSummaryResponse>>> getAllCvs() {
        List<Cv> entities = cvService.getCvsByUserId(authUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(entities.stream().map(cvMapper::toSummaryResponse).toList(), "CVs retrieved successfully"));
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<ApiResponse<CvDetailResponse>> getCvDetail(@PathVariable UUID cvId) {
        Cv cv = cvService.getCvById(cvId)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND,
                        "CV_NOT_FOUND",
                        "CV không tồn tại hoặc đã bị xóa"
                ));

        if (!cv.getUser().getId().equals(authUtils.getCurrentUserId())) {
            throw new AppException(
                    HttpStatus.FORBIDDEN,
                    "CV_ACCESS_DENIED",
                    "Bạn không có quyền xem CV này!"
            );
        }

        return ResponseEntity.ok(ApiResponse.success(cvMapper.toDetailResponse(cv), "CV retrieved successfully"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CvSummaryResponse>> uploadCv(
            @ModelAttribute @Valid CreateCvRequest request) {
        Cv savedCv = cvService.createCv(
                authUtils.getCurrentUserId(),
                request.getTitle(),
                request.getFile()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(cvMapper.toSummaryResponse(savedCv), "CV uploaded successfully"));
    }

    @PutMapping("/{cvId}/primary")
    public ResponseEntity<ApiResponse<CvSummaryResponse>> setPrimary(@PathVariable UUID cvId) {
        Cv updatedCv = cvService.setPrimaryCv(authUtils.getCurrentUserId(), cvId);
        return ResponseEntity.ok(ApiResponse.success(cvMapper.toSummaryResponse(updatedCv), "CV set as primary successfully"));
    }

    @PutMapping("/{cvId}/title")
    public ResponseEntity<ApiResponse<CvSummaryResponse>> updateTitle(@PathVariable UUID cvId, @Valid @RequestBody UpdateCvTitleRequest request) {
        String newTitle = request.getTitle();
        Cv updatedCv = cvService.updateCvTitle(authUtils.getCurrentUserId(), cvId, newTitle);
        return ResponseEntity.ok(ApiResponse.success(cvMapper.toSummaryResponse(updatedCv), "CV title updated successfully"));
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<ApiResponse<Void>> deleteCv(@PathVariable UUID cvId) {
        cvService.deleteCv(authUtils.getCurrentUserId(), cvId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa hồ sơ thành công!"));
    }
}