package sba301.hrtech.cv.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sba301.hrtech.cv.dtos.request.CreateCvRequest;
import sba301.hrtech.cv.dtos.request.UpdateCvTitleRequest;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import sba301.hrtech.cv.abstractions.services.CvService;
import sba301.hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/cvs")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CvSummaryResponse>>> getAllCvs() {
        return ResponseEntity.ok(ApiResponse.success(cvService.getCvsByCurrentUser(), "CVs retrieved successfully"));
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<ApiResponse<CvDetailResponse>> getCvDetail(@PathVariable UUID cvId) {
        return ResponseEntity.ok(ApiResponse.success(cvService.getCvById(cvId), "CV retrieved successfully"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CvSummaryResponse>> uploadCv(
            @ModelAttribute @Valid CreateCvRequest request) {
        CvSummaryResponse response = cvService.createCv(request.getTitle(), request.getFile());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "CV uploaded successfully"));
    }

    @PutMapping("/{cvId}/primary")
    public ResponseEntity<ApiResponse<CvSummaryResponse>> setPrimary(@PathVariable UUID cvId) {
        return ResponseEntity.ok(ApiResponse.success(cvService.setPrimaryCv(cvId), "CV set as primary successfully"));
    }

    @PutMapping("/{cvId}/title")
    public ResponseEntity<ApiResponse<CvSummaryResponse>> updateTitle(@PathVariable UUID cvId, @Valid @RequestBody UpdateCvTitleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(cvService.updateCvTitle(cvId, request.getTitle()), "CV title updated successfully"));
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<ApiResponse<Void>> deleteCv(@PathVariable UUID cvId) {
        cvService.deleteCv(cvId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa hồ sơ thành công!"));
    }
}