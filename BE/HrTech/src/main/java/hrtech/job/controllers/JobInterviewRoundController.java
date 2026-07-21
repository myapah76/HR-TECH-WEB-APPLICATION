package hrtech.job.controllers;

import hrtech.job.abstractions.services.IJobInterviewRoundService;
import hrtech.job.dtos.request.JobInterviewRoundRequest;
import hrtech.job.dtos.response.JobInterviewRoundResponse;
import hrtech.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs/{jobId}/interview-rounds")
@RequiredArgsConstructor
@PreAuthorize("@jobSecurity.isCompanyRecruiter(#jobId)")
public class JobInterviewRoundController {

    private final IJobInterviewRoundService jobInterviewRoundService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobInterviewRoundResponse>>> getJobInterviewRounds(
            @PathVariable UUID jobId) {
        List<JobInterviewRoundResponse> responses = jobInterviewRoundService.getRoundsByJobId(jobId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobInterviewRoundResponse>> createJobInterviewRound(
            @PathVariable UUID jobId,
            @RequestBody @Valid JobInterviewRoundRequest request) {
        JobInterviewRoundResponse response = jobInterviewRoundService.createRound(jobId, request);
        return ResponseEntity.created(URI.create("/api/jobs/" + jobId + "/interview-rounds/" + response.id()))
                .body(ApiResponse.success(response, "Tạo vòng phỏng vấn thành công."));
    }

    @PutMapping("/{roundId}")
    public ResponseEntity<ApiResponse<JobInterviewRoundResponse>> updateJobInterviewRound(
            @PathVariable UUID jobId,
            @PathVariable UUID roundId,
            @RequestBody @Valid JobInterviewRoundRequest request) {
        JobInterviewRoundResponse response = jobInterviewRoundService.updateRound(jobId, roundId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật vòng phỏng vấn thành công."));
    }

    @DeleteMapping("/{roundId}")
    public ResponseEntity<ApiResponse<Void>> deleteJobInterviewRound(
            @PathVariable UUID jobId,
            @PathVariable UUID roundId) {
        jobInterviewRoundService.deleteRound(jobId, roundId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa vòng phỏng vấn thành công."));
    }
}
