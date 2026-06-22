package sba301.hrtech.interview.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sba301.hrtech.interview.abstractions.services.IInterviewService;
import sba301.hrtech.interview.dtos.request.StartSessionRequest;
import sba301.hrtech.interview.dtos.request.SubmitAnswerRequest;
import sba301.hrtech.interview.dtos.response.AnswerSubmitResponse;
import sba301.hrtech.interview.dtos.response.InterviewResultResponse;
import sba301.hrtech.interview.dtos.response.SessionStartResponse;
import sba301.hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final IInterviewService interviewService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionStartResponse>> startSession(
            @Valid @RequestBody StartSessionRequest request
    ) {
        SessionStartResponse response = interviewService.startSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Khởi tạo phòng phỏng vấn thử thành công."));
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<ApiResponse<AnswerSubmitResponse>> submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request,
            @PathVariable UUID sessionId
    ) {
        AnswerSubmitResponse response = interviewService.submitAnswer(sessionId, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(response, "Gửi câu trả lời thành công."));
    }

    @PostMapping("/sessions/{sessionId}/submit")
    public ResponseEntity<ApiResponse<InterviewResultResponse>> submitSessionAndEvaluate(
            @PathVariable UUID sessionId
    ) {
        InterviewResultResponse response = interviewService.submitSessionAndEvaluate(sessionId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(response, "Nộp bài phỏng vấn và đánh giá kết quả thành công."));
    }

    @GetMapping("/sessions/{sessionId}/result")
    public ResponseEntity<ApiResponse<InterviewResultResponse>> getResult(
            @PathVariable UUID sessionId) {
        InterviewResultResponse response = interviewService.getResultBySessionId(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy thông tin báo cáo thành công."));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SessionStartResponse>>> getMyHistory() {
        List<SessionStartResponse> response = interviewService.getMyInterviewSessions();
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy lịch sử phỏng vấn thành công."));
    }
}
