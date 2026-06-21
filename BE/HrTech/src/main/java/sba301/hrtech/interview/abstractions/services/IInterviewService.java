package sba301.hrtech.interview.abstractions.services;

import sba301.hrtech.interview.dtos.request.StartSessionRequest;
import sba301.hrtech.interview.dtos.request.SubmitAnswerRequest;
import sba301.hrtech.interview.dtos.response.AnswerSubmitResponse;
import sba301.hrtech.interview.dtos.response.InterviewResultResponse;
import sba301.hrtech.interview.dtos.response.SessionStartResponse;

import java.util.UUID;

public interface IInterviewService {
    SessionStartResponse startSession(StartSessionRequest request);

    AnswerSubmitResponse submitAnswer(UUID sessionId, SubmitAnswerRequest request);

    InterviewResultResponse submitSessionAndEvaluate(UUID sessionId);

    InterviewResultResponse getResultBySessionId(UUID sessionId);
}
