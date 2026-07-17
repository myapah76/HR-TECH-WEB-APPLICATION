package hrtech.cv.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import hrtech.cv.dtos.request.CreateCvRequest;
import hrtech.cv.dtos.request.UpdateCvTitleRequest;
import hrtech.cv.dtos.response.CvDetailResponse;
import hrtech.cv.dtos.response.CvSummaryResponse;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/cvs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class CvController {

    private final ICvService ICvService;

    @GetMapping("/dashboard/count")
    public ResponseEntity<ApiResponse<Long>> getCvCountForDashboard() {
        return ResponseEntity.ok(ApiResponse.success(ICvService.countMyCvs()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CvSummaryResponse>>> getAllCvs() {
        return ResponseEntity.ok(ApiResponse.success(ICvService.getCvsByCurrentUser(), "CVs retrieved successfully"));
    }

    @GetMapping("/{cvId}")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'RECRUITER')")
    public ResponseEntity<ApiResponse<CvDetailResponse>> getCvDetail(@PathVariable UUID cvId) {
        return ResponseEntity.ok(ApiResponse.success(ICvService.getCvById(cvId), "CV retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CvSummaryResponse>> uploadCv(
            @RequestBody @Valid CreateCvRequest request
    ) {
        CvSummaryResponse response = ICvService.createCv(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "CV uploaded successfully"));
    }

    @PutMapping("/{cvId}/primary")
    public ResponseEntity<ApiResponse<CvSummaryResponse>> setPrimary(@PathVariable UUID cvId) {
        return ResponseEntity.ok(ApiResponse.success(ICvService.setPrimaryCv(cvId), "CV set as primary successfully"));
    }

    @PutMapping("/{cvId}/title")
    public ResponseEntity<ApiResponse<CvSummaryResponse>> updateTitle(@PathVariable UUID cvId, @Valid @RequestBody UpdateCvTitleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(ICvService.updateCvTitle(cvId, request.getTitle()), "CV title updated successfully"));
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<ApiResponse<Void>> deleteCv(@PathVariable UUID cvId) {
        ICvService.deleteCv(cvId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa hồ sơ thành công!"));
    }
}