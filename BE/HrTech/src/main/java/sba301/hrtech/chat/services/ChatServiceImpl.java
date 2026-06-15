package sba301.hrtech.chat.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sba301.hrtech.chat.abstractions.repositories.ChatMessageRepository;
import sba301.hrtech.chat.abstractions.repositories.ChatSessionRepository;
import sba301.hrtech.chat.abstractions.services.IChatService;
import sba301.hrtech.chat.dtos.request.CreateChatSessionRequest;
import sba301.hrtech.chat.dtos.request.SendChatMessageRequest;
import sba301.hrtech.chat.dtos.response.ChatMessageResponse;
import sba301.hrtech.chat.dtos.response.ChatSessionResponse;
import sba301.hrtech.chat.dtos.response.RagChatResponseDto;
import sba301.hrtech.chat.entities.ChatMessage;
import sba301.hrtech.chat.entities.ChatSession;
import sba301.hrtech.chat.enums.SenderType;
import sba301.hrtech.cv.abstractions.repositories.CvRepository;
import sba301.hrtech.cv.entities.Cv;
import sba301.hrtech.identity.entities.User;
import sba301.hrtech.identity.utils.AuthUtils;
import sba301.hrtech.job.abstractions.repositories.JobRepository;
import sba301.hrtech.job.entities.Job;
import sba301.hrtech.shared.error.ErrorCode;
import sba301.hrtech.shared.exceptions.AppException;
import sba301.hrtech.skill.services.AiServiceClient;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements IChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final JobRepository jobRepository;
    private final CvRepository cvRepository;
    private final AuthUtils authUtils;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ChatSessionResponse createSession(CreateChatSessionRequest request) {
        User currentUser = authUtils.getCurrentUser();
        Job job = null;
        Cv cv = null;
        String title = "Chat Tư vấn mới";

        if (request.getJobId() != null) {
            job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND_CODE));
            title = "Chat về công việc: " + job.getTitle();
        }

        if (request.getCvId() != null) {
            cv = cvRepository.findById(request.getCvId())
                    .orElseThrow(() -> new AppException(ErrorCode.CV_NOT_FOUND));
            if (job == null) {
                title = "Chat về CV của bạn";
            }
        }

        ChatSession session = ChatSession.builder()
                .user(currentUser)
                .job(job)
                .cv(cv)
                .title(title)
                .build();

        session = chatSessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions() {
        User currentUser = authUtils.getCurrentUser();
        return chatSessionRepository.findByUserOrderByUpdatedAtDesc(currentUser).stream()
                .map(this::toSessionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID sessionId) {
        ChatSession session = getSessionAndVerifyOwnership(sessionId);
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(UUID sessionId, SendChatMessageRequest request) {
        ChatSession session = getSessionAndVerifyOwnership(sessionId);

        // 1. Lưu tin nhắn của User
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .sender(SenderType.USER)
                .content(request.getContent())
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Gọi RAG API
        String documentId = null;
        if (session.getJob() != null) {
            documentId = session.getJob().getId().toString();
        } else if (session.getCv() != null) {
            documentId = session.getCv().getId().toString();
        }

        RagChatResponseDto aiResponse = aiServiceClient.chatWithRag(request.getContent(), documentId, 5);

        // 3. Lưu tin nhắn của AI
        String aiContent = aiResponse != null ? aiResponse.getAnswer() : "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.";
        String citationsJson = null;

        if (aiResponse != null && aiResponse.getCitations() != null && !aiResponse.getCitations().isEmpty()) {
            try {
                citationsJson = objectMapper.writeValueAsString(aiResponse.getCitations());
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize citations", e);
            }
        }

        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .sender(SenderType.AI)
                .content(aiContent)
                .citations(citationsJson)
                .build();
        aiMessage = chatMessageRepository.save(aiMessage);

        // Cập nhật session updatedAt
        session.setUpdatedAt(Instant.now());
        chatSessionRepository.save(session);

        return toMessageResponse(aiMessage);
    }

    private ChatSession getSessionAndVerifyOwnership(UUID sessionId) {
        User currentUser = authUtils.getCurrentUser();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.SESSION_NOT_FOUND));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return session;
    }

    private ChatSessionResponse toSessionResponse(ChatSession session) {
        return ChatSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .jobId(session.getJob() != null ? session.getJob().getId() : null)
                .jobTitle(session.getJob() != null ? session.getJob().getTitle() : null)
                .cvId(session.getCv() != null ? session.getCv().getId() : null)
                .createdAt(session.getCreatedAt())
                .build();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .sender(message.getSender())
                .content(message.getContent())
                .citations(message.getCitations())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
