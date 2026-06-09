package sba301.hrtech.cv.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.cv.dtos.request.CreateCvRequest;
import sba301.hrtech.cv.dtos.response.CvDetailResponse;
import sba301.hrtech.cv.dtos.response.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.mapper.CvMapper;
import sba301.hrtech.cv.abstractions.services.CvService;
import sba301.hrtech.shared.exceptions.AppException;

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
    public ResponseEntity<List<CvSummaryResponse>> getAllCvs() {
        List<Cv> entities = cvService.getCvsByUserId(authUtils.getCurrentUserId());
        return ResponseEntity.ok(entities.stream().map(cvMapper::toSummaryResponse).toList());
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<CvDetailResponse> getCvDetail(@PathVariable UUID cvId) {
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

        return ResponseEntity.ok(cvMapper.toDetailResponse(cv));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CvSummaryResponse> uploadCv(
            @ModelAttribute @Valid CreateCvRequest request) {
        Cv savedCv = cvService.createCv(
                authUtils.getCurrentUserId(),
                request.getTitle(),
                request.getFile()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(cvMapper.toSummaryResponse(savedCv));
    }

    @PutMapping("/{cvId}/primary")
    public ResponseEntity<CvSummaryResponse> setPrimary(@PathVariable UUID cvId) {
        Cv updatedCv = cvService.setPrimaryCv(authUtils.getCurrentUserId(), cvId);
        return ResponseEntity.ok(cvMapper.toSummaryResponse(updatedCv));
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<String> deleteCv(@PathVariable UUID cvId) {
        cvService.deleteCv(authUtils.getCurrentUserId(), cvId);
        return ResponseEntity.ok("Xóa hồ sơ thành công!");
    }
}