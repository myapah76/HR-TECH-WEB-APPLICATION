package sba301.hrtech.cv.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCvRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống")
    private String title;

    @NotBlank(message = "Đường dẫn file CV không được để trống")
    private String fileUrl;
}