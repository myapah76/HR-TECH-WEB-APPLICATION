package hrtech.interview.services;

import hrtech.interview.dtos.client.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.interview.abstractions.repositories.InterviewAnswerRepository;
import hrtech.interview.abstractions.repositories.InterviewQuestionRepository;
import hrtech.interview.abstractions.repositories.InterviewResultRepository;
import hrtech.interview.abstractions.repositories.InterviewSessionRepository;
import hrtech.interview.abstractions.services.IInterviewService;
import hrtech.interview.dtos.response.DetailedFeedbackItem;
import hrtech.interview.dtos.request.StartSessionRequest;
import hrtech.interview.dtos.request.SubmitAnswerRequest;
import hrtech.interview.dtos.response.AnswerSubmitResponse;
import hrtech.interview.dtos.response.InterviewResultResponse;
import hrtech.interview.dtos.response.QuestionResponse;
import hrtech.interview.dtos.response.SessionStartResponse;
import hrtech.interview.entities.InterviewAnswer;
import hrtech.interview.entities.InterviewQuestion;
import hrtech.interview.entities.InterviewResult;
import hrtech.interview.entities.InterviewSession;
import hrtech.interview.entities.enums.InterviewStatus;
import hrtech.interview.mapper.InterviewQuestionMapper;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.entities.Job;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.shared.services.CloudinaryService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class InterviewServiceImpl implements IInterviewService {

    private final ICvService cvService;
    private final IJobService jobService;
    private final InterviewAiServiceClient interviewAiServiceClient;
    private final CloudinaryService cloudinaryService;

    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final InterviewResultRepository interviewResultRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;

    private final AuthUtils authUtils;

    private final InterviewQuestionMapper interviewQuestionMapper;

    private final TransactionTemplate transactionTemplate;

    @Override
    public SessionStartResponse startSession(StartSessionRequest request) {
        User user = authUtils.getCurrentUser();
        Cv cv = cvService.getCvEntityById(request.cvId());
        // Kiểm tra CV có thuộc về user hiện tại hay không
        if (!cv.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.CV_NOT_BELONG_TO_USER);
        }

        Job job = null;
        String jdText = "";
        // Nếu có jobId, lấy thông tin JD để cung cấp cho AI sinh câu hỏi sát hơn
        if (request.jobId() != null) {
            job = jobService.getJobEntityById(request.jobId());
            jdText = getJdTextForJob(job);
        }

        // Gọi AI sinh câu hỏi
        List<String> rawQuestions = interviewAiServiceClient.generateInterviewQuestions(
                cv.getParsedContent(),
                jdText,
                request.targetRole());
        // Kiểm tra nếu AI không sinh được câu hỏi nào
        if (rawQuestions.isEmpty()) {
            throw new AppException(ErrorCode.GENERATE_QUESTION_FAILED);
        }

        // Lưu session vào database với trạng thái IN_PROGRESS
        InterviewSession session = InterviewSession.builder()
                .cv(cv)
                .job(job)
                .user(user)
                .targetRole(request.targetRole())
                .status(InterviewStatus.IN_PROGRESS)
                .build();

        // Lưu danh sách câu hỏi
        List<InterviewQuestion> questions = new ArrayList<>();
        for (int i = 0; i < rawQuestions.size(); i++) {
            InterviewQuestion question = InterviewQuestion.builder()
                    .session(session)
                    .questionText(rawQuestions.get(i))
                    .orderIndex(i)
                    .build();
            questions.add(question);
        }
        session.setQuestions(questions);
        interviewSessionRepository.save(session);

        return SessionStartResponse.builder()
                .sessionId(session.getId())
                .targetRole(session.getTargetRole())
                .status(session.getStatus())
                .totalQuestions(questions.size())
                .currentQuestion(interviewQuestionMapper.toResponse(questions.getFirst()))
                .build();
    }

    @Override
    public AnswerSubmitResponse submitAnswer(UUID sessionId, SubmitAnswerRequest request) {
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND));
        // Kiểm tra quyền truy cập: chỉ user sở hữu session mới được submit answer
        if (!session.getUser().getId().equals(authUtils.getCurrentUserId())) {
            throw new AppException(ErrorCode.INTERVIEW_SESSION_ACCESS_DENIED);
        }
        // Kiểm tra trạng thái phiên phỏng vấn có đang ở trạng thái IN_PROGRESS hay
        // không
        if (!session.getStatus().equals(InterviewStatus.IN_PROGRESS)) {
            throw new AppException(ErrorCode.INTERVIEW_SESSION_NOT_IN_PROGRESS);
        }

        InterviewQuestion question = interviewQuestionRepository.findById(request.questionId())
                .orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_QUESTION_NOT_FOUND));
        // Kiểm tra câu hỏi có thuộc về phiên phỏng vấn hiện tại hay không
        if (!question.getSession().getId().equals(sessionId)) {
            throw new AppException(ErrorCode.INTERVIEW_QUESTION_NOT_BELONG_TO_SESSION);
        }
        // Kiểm tra URL âm thanh có hợp lệ hay không
        cloudinaryService.checkValidUrl(request.audioUrl());
        // Lưu câu trả lời
        InterviewAnswer answer = InterviewAnswer.builder()
                .question(question)
                .audioUrl(request.audioUrl())
                .build();
        question.setAnswer(answer);

        final String cvText = session.getCv().getParsedContent();
        final String jdText = getJdTextForJob(session.getJob());
        final String qText = question.getQuestionText();
        final String audioUrl = request.audioUrl();
        final UUID answerId = answer.getId();
        // Gọi AI phân tích câu trả lời bất đồng bộ
        CompletableFuture.runAsync(() -> {
            try {
                EvaluateAnswerRequest evaluateAnswerRequest = EvaluateAnswerRequest.builder()
                        .cv_text(cvText)
                        .jd_text(jdText)
                        .question(qText)
                        .audio_url(audioUrl)
                        .build();
                // Gọi API AI phân tích tệp âm thanh
                EvaluateAnswerResponse evaluation = interviewAiServiceClient.evaluateAnswer(evaluateAnswerRequest);

                // Cập nhật các thông tin feedback vào DB
                transactionTemplate.executeWithoutResult(status -> {
                    InterviewAnswer answerToUpdate = interviewAnswerRepository.findById(answerId)
                            .orElse(null);
                    if (answerToUpdate != null) {
                        answerToUpdate.setScore(evaluation.getScore());
                        answerToUpdate.setFeedback(evaluation.getFeedback());
                        answerToUpdate.setModelAnswer(evaluation.getModelAnswer());
                        interviewAnswerRepository.save(answerToUpdate);
                    }
                });
            } catch (Exception e) {
                log.error("Lỗi phân tích âm thanh bất đồng bộ cho câu trả lời ID " + answerId, e);
            }
        });
        // Tìm câu hỏi tiếp theo dựa trên orderIndex
        InterviewQuestion nextQuestion = interviewQuestionRepository.findBySessionIdAndOrderIndex(
                sessionId, question.getOrderIndex() + 1).orElse(null);

        if (nextQuestion != null) {
            // Còn câu tiếp theo
            return AnswerSubmitResponse.builder()
                    .isFinished(false)
                    .nextQuestion(interviewQuestionMapper.toResponse(nextQuestion))
                    .build();
        } else {
            // Hết câu hỏi
            return AnswerSubmitResponse.builder()
                    .isFinished(true)
                    .build();
        }

    }

    @Override
    public InterviewResultResponse submitSessionAndEvaluate(UUID sessionId) {
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND));
        // Kiểm tra quyền truy cập: chỉ user sở hữu session mới được submit answer
        if (!session.getUser().getId().equals(authUtils.getCurrentUserId())) {
            throw new AppException(ErrorCode.INTERVIEW_SESSION_ACCESS_DENIED);
        }
        // Kiểm tra trạng thái phiên phỏng vấn
        if (session.getStatus() == InterviewStatus.COMPLETED) {
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_EVALUATED);
        }
        // Đọc lịch sử câu hỏi/câu trả lời
        List<InterviewQuestion> questions = interviewQuestionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        List<InterviewQAItem> history = new ArrayList<>();
        List<DetailedFeedbackItem> detailedFeedbacks = new ArrayList<>();

        for (InterviewQuestion question : questions) {
            InterviewAnswer answer = question.getAnswer();
            if (answer != null) {
                // Nếu chưa có kết quả chấm điểm ngầm, thực hiện gọi đồng bộ để lấy kết quả
                if (answer.getScore() == null) {
                    try {
                        EvaluateAnswerRequest evalRequest = EvaluateAnswerRequest.builder()
                                .cv_text(session.getCv().getParsedContent())
                                .jd_text(getJdTextForJob(session.getJob()))
                                .question(question.getQuestionText())
                                .audio_url(answer.getAudioUrl())
                                .build();
                        EvaluateAnswerResponse evaluation = interviewAiServiceClient.evaluateAnswer(evalRequest);
                        answer.setScore(evaluation.getScore());
                        answer.setFeedback(evaluation.getFeedback());
                        answer.setModelAnswer(evaluation.getModelAnswer());
                        interviewAnswerRepository.save(answer);
                    } catch (Exception e) {
                        answer.setScore(0.0);
                        answer.setFeedback("Lỗi phân tích đồng bộ khi nộp bài");
                        answer.setModelAnswer("");
                        interviewAnswerRepository.save(answer);
                    }
                }

                // Đưa vào lịch sử đánh giá tổng quan (dùng question, score và feedback)
                history.add(InterviewQAItem.builder()
                        .question(question.getQuestionText())
                        .score(answer.getScore())
                        .feedback(answer.getFeedback())
                        .build());

                // Đưa vào chi tiết feedback cho FE
                detailedFeedbacks.add(DetailedFeedbackItem.builder()
                        .question(question.getQuestionText())
                        .audioUrl(answer.getAudioUrl())
                        .score(answer.getScore())
                        .feedback(answer.getFeedback())
                        .modelAnswer(answer.getModelAnswer())
                        .build());
            }
        }

        // Lấy JD text nếu có để cung cấp cho AI đánh giá sát hơn
        String jdText = getJdTextForJob(session.getJob());
        // Gọi AI đánh giá buổi phỏng vấn
        EvaluateSessionRequest evaluateSessionRequest = EvaluateSessionRequest.builder()
                .cv_text(session.getCv().getParsedContent())
                .jd_text(jdText)
                .history(history)
                .build();
        EvaluateSessionResponse evaluate = interviewAiServiceClient.evaluateInterviewSession(evaluateSessionRequest);
        // Nếu AI đánh giá thất bại (có thể do lỗi hệ thống hoặc không đủ dữ liệu)
        if (evaluate == null) {
            session.setStatus(InterviewStatus.FAILED);
            throw new AppException(ErrorCode.EVALUATE_SESSION_FAILED);
        }
        // Lưu kết quả đánh giá vào cơ sở dữ liệu
        InterviewResult result = InterviewResult.builder()
                .session(session)
                .overallScore(evaluate.getOverallScore())
                .technicalScore(evaluate.getTechnicalScore())
                .communicationScore(evaluate.getCommunicationScore())
                .softSkillsScore(evaluate.getSoftSkillsScore())
                .strengths(evaluate.getStrengths())
                .weaknesses(evaluate.getWeaknesses())
                .generalFeedback(evaluate.getGeneralFeedback())
                .build();

        session.setStatus(InterviewStatus.COMPLETED);
        session.setCompletedAt(Instant.now());
        session.setResult(result);

        return InterviewResultResponse.builder()
                .sessionId(session.getId())
                .overallScore(result.getOverallScore())
                .technicalScore(result.getTechnicalScore())
                .communicationScore(result.getCommunicationScore())
                .softSkillsScore(result.getSoftSkillsScore())
                .strengths(result.getStrengths())
                .weaknesses(result.getWeaknesses())
                .generalFeedback(result.getGeneralFeedback())
                .detailedFeedback(detailedFeedbacks)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResultResponse getResultBySessionId(UUID sessionId) {
        InterviewResult result = interviewResultRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESULT_NOT_FOUND));

        List<InterviewQuestion> questions = interviewQuestionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        List<DetailedFeedbackItem> detailedFeedbacks = new ArrayList<>();

        for (InterviewQuestion question : questions) {
            InterviewAnswer answer = question.getAnswer();
            detailedFeedbacks.add(DetailedFeedbackItem.builder()
                    .question(question.getQuestionText())
                    .audioUrl(answer != null ? answer.getAudioUrl() : "")
                    .score(answer != null ? answer.getScore() : 0.0)
                    .feedback(answer != null ? answer.getFeedback() : "Không có feedback")
                    .modelAnswer(answer != null ? answer.getModelAnswer() : "")
                    .build());
        }

        return InterviewResultResponse.builder()
                .sessionId(sessionId)
                .overallScore(result.getOverallScore())
                .technicalScore(result.getTechnicalScore())
                .communicationScore(result.getCommunicationScore())
                .softSkillsScore(result.getSoftSkillsScore())
                .strengths(result.getStrengths())
                .weaknesses(result.getWeaknesses())
                .generalFeedback(result.getGeneralFeedback())
                .detailedFeedback(detailedFeedbacks)
                .build();
    }

    @Override
    public List<SessionStartResponse> getMyInterviewSessions() {
        UUID currentUserId = authUtils.getCurrentUserId();
        List<InterviewSession> sessions = interviewSessionRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);

        return sessions.stream()
                .map(session -> {
                    var questions = session.getQuestions();
                    QuestionResponse questionResponse = null;
                    if (session.getStatus() == InterviewStatus.IN_PROGRESS && questions != null
                            && !questions.isEmpty()) {
                        InterviewQuestion nextUnanswered = questions.stream()
                                .filter(q -> q.getAnswer() == null)
                                .min(Comparator.comparingInt(interviewQuestion -> interviewQuestion.getOrderIndex()))
                                .orElse(null);
                        if (nextUnanswered != null) {
                            questionResponse = interviewQuestionMapper.toResponse(nextUnanswered);
                        } else {
                            questionResponse = interviewQuestionMapper.toResponse(
                                    questions.stream()
                                            .max(Comparator.comparingInt(q -> q.getOrderIndex()))
                                            .orElse(questions.getFirst()));
                        }
                    }

                    return SessionStartResponse.builder()
                            .sessionId(session.getId())
                            .targetRole(session.getTargetRole())
                            .status(session.getStatus())
                            .totalQuestions(session.getQuestions() != null ? session.getQuestions().size() : 0)
                            .currentQuestion(questionResponse)
                            .build();
                }).toList();
    }

    private String getJdTextForJob(Job job) {
        if (job == null)
            return "";
        return (job.getDescription() != null ? job.getDescription() : "") + "\n" +
                (job.getRequirements() != null ? job.getRequirements() : "");
    }
}
