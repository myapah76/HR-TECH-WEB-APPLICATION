package sba301.hrtech.application.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SubmitApplicationRequest {
    @NotNull(message = "Job không được để trống")
    private UUID jobId;

    @NotNull(message = "CV không được để trống")
    private UUID cvId;

    private String coverLetter;
}
