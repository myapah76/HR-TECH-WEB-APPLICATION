package hrtech.cv.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCvRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống")
    private String title;

    @NotNull(message = "File URL không được để trống")
    private String fileUrl;
}