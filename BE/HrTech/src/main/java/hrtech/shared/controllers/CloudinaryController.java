package hrtech.shared.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import hrtech.shared.dtos.CloudinarySignatureResponse;
import hrtech.shared.response.ApiResponse;
import hrtech.shared.services.CloudinaryService;

@RestController
@RequestMapping("/api/cloudinary")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @GetMapping("/signature")
    public ApiResponse<CloudinarySignatureResponse> getUploadSignature(
            @RequestParam("folder") String folder
    ) {
        return ApiResponse.success(
                cloudinaryService.generateUploadSignature(folder),
                "Tạo chữ ký upload thành công"
        );
    }
}
