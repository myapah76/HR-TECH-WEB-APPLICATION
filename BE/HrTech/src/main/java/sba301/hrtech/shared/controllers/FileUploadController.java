package sba301.hrtech.shared.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sba301.hrtech.shared.response.ApiResponse;
import sba301.hrtech.shared.services.CloudinaryService;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "hrtech/companies") String folder
    ) {
        String fileUrl = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "File uploaded successfully"));
    }
}
