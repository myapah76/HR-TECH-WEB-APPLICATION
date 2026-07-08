package hrtech.interview.abstractions.services;

import hrtech.interview.dtos.request.StartSessionRequest;
import hrtech.interview.dtos.request.SubmitAnswerRequest;
import hrtech.interview.dtos.response.AnswerSubmitResponse;
import hrtech.interview.dtos.response.InterviewResultResponse;
import hrtech.interview.dtos.response.SessionStartResponse;

import java.util.List;
import java.util.UUID;

public interface IInterviewService {
    SessionStartResponse startSession(StartSessionRequest request);

    AnswerSubmitResponse submitAnswer(UUID sessionId, SubmitAnswerRequest request);

    InterviewResultResponse submitSessionAndEvaluate(UUID sessionId);

    InterviewResultResponse getResultBySessionId(UUID sessionId);

    List<SessionStartResponse> getMyInterviewSessions();
}
