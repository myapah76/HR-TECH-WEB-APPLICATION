package sba301.hrtech.skill.services;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import sba301.hrtech.skill.dtos.response.JobMatchingTaskResponse;
import sba301.hrtech.skill.abstractions.services.ISkillExtractionService;
import sba301.hrtech.skill.abstractions.services.IRecommendationService;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobMatchingService {

    private final ISkillExtractionService skillExtractionService;
    private final IRecommendationService recommendationService;

    // In-memory map to store task statuses
    private final Map<String, JobMatchingTaskResponse> tasks = new ConcurrentHashMap<>();

    public String startJobMatchingForCv(UUID cvId) {
        String taskId = UUID.randomUUID().toString();
        tasks.put(taskId, JobMatchingTaskResponse.builder()
                .taskId(taskId)
                .status("EXTRACTING_SKILLS")
                .message("Đang bóc tách kỹ năng từ CV...")
                .progressPercentage(10)
                .recommendedJobs(Collections.emptyList())
                .build());

        // Run async
        processJobMatchingAsync(taskId, cvId);

        return taskId;
    }

    @Async
    public void processJobMatchingAsync(String taskId, UUID cvId) {
        try {
            // 1. Extract Skills
            // Since extractAndSaveSkills is async and returns CompletableFuture, we wait for it
            skillExtractionService.extractAndSaveSkills(cvId).join();

            // Wait to let background relationship mapping finish
            updateTaskStatus(taskId, "MAPPING_RELATIONSHIPS", "Đang phân tích và thiết lập các kỹ năng liên quan bằng Chat Model...", 50);
            try {
                Thread.sleep(4000); // 4 seconds for Gemma/Gemini to process
            } catch (InterruptedException ignored) {}

            updateTaskStatus(taskId, "CALCULATING_MATCHES", "Đang chấm điểm Graph Score với hệ thống công việc...", 80);
            
            var recommendations = recommendationService.recommendJobsForCv(cvId, 20);

            JobMatchingTaskResponse finalState = tasks.get(taskId);
            finalState.setStatus("COMPLETED");
            finalState.setMessage("Hoàn thành quá trình phân tích.");
            finalState.setProgressPercentage(100);
            finalState.setRecommendedJobs(recommendations);
            
        } catch (Exception e) {
            log.error("Job matching failed for taskId {}", taskId, e);
            updateTaskStatus(taskId, "FAILED", "Có lỗi xảy ra: " + e.getMessage(), 0);
        }
    }

    public JobMatchingTaskResponse getTaskStatus(String taskId) {
        return tasks.get(taskId);
    }

    private void updateTaskStatus(String taskId, String status, String message, int progress) {
        JobMatchingTaskResponse task = tasks.get(taskId);
        if (task != null) {
            task.setStatus(status);
            task.setMessage(message);
            task.setProgressPercentage(progress);
        }
    }
}
