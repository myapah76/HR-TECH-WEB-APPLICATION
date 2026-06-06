package sba301.hrtech.cv.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCvRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống")
    private String title;

    @NotNull(message = "File CV không được để trống")
    private MultipartFile file;
}