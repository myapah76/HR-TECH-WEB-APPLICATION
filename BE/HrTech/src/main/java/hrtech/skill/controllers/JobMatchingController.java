package hrtech.skill.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import hrtech.shared.response.ApiResponse;
import hrtech.skill.dtos.response.JobMatchingTaskResponse;
import hrtech.skill.services.JobMatchingService;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class JobMatchingController {

    private final JobMatchingService jobMatchingService;

    @PostMapping("/start-job-matching/{cvId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> startJobMatching(@PathVariable UUID cvId) {
        String taskId = jobMatchingService.startJobMatchingForCv(cvId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("taskId", taskId)));
    }

    @GetMapping("/job-matching-status/{taskId}")
    public ResponseEntity<ApiResponse<JobMatchingTaskResponse>> getTaskStatus(@PathVariable String taskId) {
        JobMatchingTaskResponse status = jobMatchingService.getTaskStatus(taskId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
