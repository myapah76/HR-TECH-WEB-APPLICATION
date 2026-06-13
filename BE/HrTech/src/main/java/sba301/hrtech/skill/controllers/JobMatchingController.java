package sba301.hrtech.skill.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.skill.dtos.response.JobMatchingTaskResponse;
import sba301.hrtech.skill.services.JobMatchingService;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class JobMatchingController {

    private final JobMatchingService jobMatchingService;

    @PostMapping("/start-job-matching/{cvId}")
    public ResponseEntity<Map<String, String>> startJobMatching(@PathVariable UUID cvId) {
        String taskId = jobMatchingService.startJobMatchingForCv(cvId);
        return ResponseEntity.ok(Map.of("taskId", taskId));
    }

    @GetMapping("/job-matching-status/{taskId}")
    public ResponseEntity<JobMatchingTaskResponse> getTaskStatus(@PathVariable String taskId) {
        JobMatchingTaskResponse status = jobMatchingService.getTaskStatus(taskId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(status);
    }
}
