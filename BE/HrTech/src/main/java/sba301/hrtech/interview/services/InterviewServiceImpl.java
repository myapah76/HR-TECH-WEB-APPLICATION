package sba301.hrtech.interview.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.cv.abstractions.services.ICvService;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.interview.abstractions.repositories.InterviewQuestionRepository;
import sba301.hrtech.interview.abstractions.repositories.InterviewResultRepository;
import sba301.hrtech.interview.abstractions.repositories.InterviewSessionRepository;
import sba301.hrtech.interview.abstractions.services.IInterviewService;
import sba301.hrtech.interview.dtos.client.PyEvaluateSessionResponse;
import sba301.hrtech.interview.dtos.client.PyInterviewQAItem;
import sba301.hrtech.interview.dtos.request.StartSessionRequest;
import sba301.hrtech.interview.dtos.request.SubmitAnswerRequest;
import sba301.hrtech.interview.dtos.response.AnswerSubmitResponse;
import sba301.hrtech.interview.dtos.response.InterviewResultResponse;
import sba301.hrtech.interview.dtos.response.SessionStartResponse;
import sba301.hrtech.interview.entities.InterviewAnswer;
import sba301.hrtech.interview.entities.InterviewQuestion;
import sba301.hrtech.interview.entities.InterviewResult;
import sba301.hrtech.interview.entities.InterviewSession;
import sba301.hrtech.interview.entities.enums.InterviewStatus;
import sba301.hrtech.interview.mapper.InterviewQuestionMapper;
import sba301.hrtech.job.abstractions.services.IJobService;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class InterviewServiceImpl implements IInterviewService {

    private final ICvService cvService;
    private final IJobService jobService;
    private final InterviewAiServiceClient interviewAiServiceClient;

    private final InterviewSessionRepository interviewSessionRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final InterviewResultRepository interviewResultRepository;

    private final AuthUtils authUtils;

    private final InterviewQuestionMapper interviewQuestionMapper;

    @Override
    public SessionStartResponse startSession(StartSessionRequest request) {
        User user = authUtils.getCurrentUser();
        Cv cv = cvService.getCvEntityById(request.cvId());
        // Kiểm tra CV có thuộc về user hiện tại hay không
        if(!cv.getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.CV_NOT_BELONG_TO_USER);
        }

        Job job = null;
        String jdText = "";
        // Nếu có jobId, lấy thông tin JD để cung cấp cho AI sinh câu hỏi sát hơn
        if(request.jobId() != null){
            job = jobService.getJobEntityById(request.jobId());
            jdText = getJdTextForJob(job);
        }

        // Gọi AI sinh câu hỏi
        List<String> rawQuestions = interviewAiServiceClient.generateInterviewQuestions(
                cv.getParsedContent(),
                jdText,
                request.targetRole()
        );
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
        for(int i = 0; i < rawQuestions.size(); i++){
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
        if(!session.getUser().getId().equals(authUtils.getCurrentUserId())){
            throw new AppException(ErrorCode.INTERVIEW_SESSION_ACCESS_DENIED);
        }
        // Kiểm tra trạng thái phiên phỏng vấn có đang ở trạng thái IN_PROGRESS hay không
        if(!session.getStatus().equals(InterviewStatus.IN_PROGRESS)){
            throw new AppException(ErrorCode.INTERVIEW_SESSION_NOT_IN_PROGRESS);
        }

        InterviewQuestion question = interviewQuestionRepository.findById(request.questionId())
                .orElseThrow(() -> new AppException(ErrorCode.INTERVIEW_QUESTION_NOT_FOUND));
        // Kiểm tra câu hỏi có thuộc về phiên phỏng vấn hiện tại hay không
        if(!question.getSession().getId().equals(sessionId)) {
            throw new AppException(ErrorCode.INTERVIEW_QUESTION_NOT_BELONG_TO_SESSION);
        }

        // Lưu câu trả lời vào cơ sở dữ liệu
        InterviewAnswer answer = InterviewAnswer.builder()
                .question(question)
                .answerText(request.answerText())
                .build();
        question.setAnswer(answer);
        // Tìm câu hỏi tiếp theo dựa trên orderIndex
        InterviewQuestion nextQuestion = interviewQuestionRepository.findBySessionIdAndOrderIndex(
                sessionId, question.getOrderIndex() + 1
        ).orElse(null);

        if(nextQuestion != null){
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
        if(!session.getUser().getId().equals(authUtils.getCurrentUserId())){
            throw new AppException(ErrorCode.INTERVIEW_SESSION_ACCESS_DENIED);
        }
        // Kiểm tra trạng thái phiên phỏng vấn
        if(session.getStatus() == InterviewStatus.COMPLETED){
            throw new AppException(ErrorCode.INTERVIEW_ALREADY_EVALUATED);
        }
        // Đọc lịch sử câu hỏi/câu trả lời
        List<InterviewQuestion> questions = interviewQuestionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        List<PyInterviewQAItem> history = new ArrayList<>();
        for(InterviewQuestion question : questions){
            String answerText = question.getAnswer() != null ? question.getAnswer().getAnswerText() : "Không trả lời";
            history.add(new PyInterviewQAItem(question.getQuestionText(), answerText));
        }
        // Lấy JD text nếu có để cung cấp cho AI đánh giá sát hơn
        String jdText = getJdTextForJob(session.getJob());
        // Gọi AI đánh giá buổi phỏng vấn
        PyEvaluateSessionResponse evaluate = interviewAiServiceClient.evaluateInterviewSession(
                session.getCv().getParsedContent(),
                jdText,
                history
        );
        // Nếu AI đánh giá thất bại (có thể do lỗi hệ thống hoặc không đủ dữ liệu)
        if(evaluate == null){
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
                .detailedFeedback(evaluate.getDetailedFeedback())
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
                .detailedFeedback(result.getDetailedFeedback())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResultResponse getResultBySessionId(UUID sessionId) {
        InterviewResult result = interviewResultRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESULT_NOT_FOUND));

        return InterviewResultResponse.builder()
                .sessionId(sessionId)
                .overallScore(result.getOverallScore())
                .technicalScore(result.getTechnicalScore())
                .communicationScore(result.getCommunicationScore())
                .softSkillsScore(result.getSoftSkillsScore())
                .strengths(result.getStrengths())
                .weaknesses(result.getWeaknesses())
                .generalFeedback(result.getGeneralFeedback())
                .detailedFeedback(result.getDetailedFeedback())
                .build();
    }

    private String getJdTextForJob(Job job){
        if(job == null) return "";
        return (job.getDescription() != null ? job.getDescription() : "") + "\n" +
                (job.getRequirements() != null ? job.getRequirements() : "");
    }
}
