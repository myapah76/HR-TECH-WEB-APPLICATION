package sba301.hrtech.skill.services;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.shared.enums.ExtractionStatus;
import sba301.hrtech.skill.dtos.response.JobMatchingTaskResponse;
import sba301.hrtech.skill.abstractions.services.IRecommendationService;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobMatchingService {

    private final IRecommendationService recommendationService;
    private final CvRepository cvRepository;

    // In-memory map to store task statuses
    private final Map<String, JobMatchingTaskResponse> tasks = new ConcurrentHashMap<>();

    public String startJobMatchingForCv(UUID cvId) {
        String taskId = UUID.randomUUID().toString();
        tasks.put(taskId, JobMatchingTaskResponse.builder()
                .taskId(taskId)
                .status("EXTRACTING")
                .message("Đang bóc tách kỹ năng từ CV...")
                .progressPercentage(10)
                .recommendedJobs(Collections.emptyList())
                .build());

        // Run async manually to bypass Spring proxy limitation
        CompletableFuture.runAsync(() -> processJobMatchingAsync(taskId, cvId));

        return taskId;
    }

    public void processJobMatchingAsync(String taskId, UUID cvId) {
        try {
            // 1. Wait for Extract Skills to finish (it's triggered asynchronously upon CV upload)
            Cv cv = cvRepository.findById(cvId).orElseThrow();
            while (cv.getExtractionStatus() == ExtractionStatus.PENDING ||
                   cv.getExtractionStatus() == ExtractionStatus.PROCESSING) {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ignored) {}
                cv = cvRepository.findById(cvId).orElseThrow();
            }
            
            if (cv.getExtractionStatus() == ExtractionStatus.FAILED) {
                throw new RuntimeException("Quá trình bóc tách CV thất bại hoặc file không hợp lệ.");
            }

            // Wait to let background relationship mapping finish
            updateTaskStatus(taskId, "MAPPING", "Đang phân tích và thiết lập các kỹ năng liên quan bằng Chat Model...", 50);
            try {
                Thread.sleep(4000); // 4 seconds for Gemma/Gemini to process
            } catch (InterruptedException ignored) {}

            updateTaskStatus(taskId, "SCORING", "Đang chấm điểm Graph Score với hệ thống công việc...", 80);
            
            var recommendations = recommendationService.recommendJobsForCv(cvId, 20)
                .stream()
                .filter(rec -> rec.getMatchScore() > 0.0)
                .toList();

            JobMatchingTaskResponse finalState = tasks.get(taskId);
            finalState.setStatus("DONE");
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
