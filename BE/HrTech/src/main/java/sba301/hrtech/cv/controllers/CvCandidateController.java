package sba301.hrtech.cv.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;


import sba301.hrtech.auth.dtos.user.CustomUserDetails;
import sba301.hrtech.cv.dtos.CreateCvRequest;
import sba301.hrtech.cv.dtos.CvDetailResponse;
import sba301.hrtech.cv.dtos.CvSummaryResponse;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.cv.mapper.CvMapper;
import sba301.hrtech.cv.services.CvService;
import sba301.hrtech.auth.entities.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/my-cvs")
public class CvCandidateController {

    private final CvService cvService;
    private final CvMapper cvMapper;

    public CvCandidateController(CvService cvService, CvMapper cvMapper) {
        this.cvService = cvService;
        this.cvMapper = cvMapper;
    }

    @GetMapping
    public ResponseEntity<List<CvSummaryResponse>> getAllCvs() {
        UUID currentUserId = getAuthenticatedUserId();
        List<Cv> entities = cvService.getCvsByUserId(currentUserId);
        List<CvSummaryResponse> response = entities.stream()
                .map(cvMapper::toSummaryResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{cvId}")
    public ResponseEntity<CvDetailResponse> getCvDetail(@PathVariable UUID cvId) {
        Cv cv = cvService.getCvById(cvId)
                .orElseThrow(() -> new RuntimeException("CV không tồn tại hoặc đã bị xóa"));

        if (!cv.getUser().getId().equals(getAuthenticatedUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(cvMapper.toDetailResponse(cv));
    }

    @PostMapping("/upload")
    public ResponseEntity<CvSummaryResponse> uploadCv(@Valid @RequestBody CreateCvRequest request) {
        UUID currentUserId = getAuthenticatedUserId();
        Cv savedCv = cvService.createCv(currentUserId, request.getTitle(), request.getFileUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(cvMapper.toSummaryResponse(savedCv));
    }

    @PutMapping("/{cvId}/set-primary")
    public ResponseEntity<CvSummaryResponse> setPrimary(@PathVariable UUID cvId) {
        UUID currentUserId = getAuthenticatedUserId();
        Cv updatedCv = cvService.setPrimaryCv(currentUserId, cvId);
        return ResponseEntity.ok(cvMapper.toSummaryResponse(updatedCv));
    }

    @DeleteMapping("/{cvId}")
    public ResponseEntity<String> deleteCv(@PathVariable UUID cvId) {
        UUID currentUserId = getAuthenticatedUserId();
        cvService.deleteCv(currentUserId, cvId);
        return ResponseEntity.ok("Xóa hồ sơ thành công!");
    }


    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Phiên đăng nhập không tồn tại hoặc đã hết hạn!");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.user().getId();
        }

        if (principal instanceof User user) {
            return user.getId();
        }

        throw new RuntimeException("Tài khoản chưa được xác thực trên hệ thống bảo mật!");
    }
}