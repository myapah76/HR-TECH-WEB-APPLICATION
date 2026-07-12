package hrtech.chat.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import hrtech.chat.abstractions.repositories.ChatMessageRepository;
import hrtech.chat.abstractions.repositories.ChatSessionRepository;
import hrtech.chat.abstractions.services.IChatService;
import hrtech.chat.dtos.request.CreateChatSessionRequest;
import hrtech.chat.dtos.request.SendChatMessageRequest;
import hrtech.chat.dtos.response.ChatMessageResponse;
import hrtech.chat.dtos.response.ChatSessionResponse;
import hrtech.chat.dtos.response.RagChatResponseDto;
import hrtech.chat.entities.ChatMessage;
import hrtech.chat.entities.ChatSession;
import hrtech.chat.enums.SenderType;
import hrtech.chat.mapper.ChatMapper;
import hrtech.cv.abstractions.services.ICvService;
import hrtech.cv.entities.Cv;
import hrtech.identity.entities.User;
import hrtech.identity.utils.AuthUtils;
import hrtech.job.abstractions.services.IJobService;
import hrtech.job.entities.Job;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.skill.services.AiServiceClient;

import hrtech.subscription.abstractions.services.ICreditService;

import java.io.InputStream;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements IChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final IJobService jobService;
    private final ICvService cvService;
    private final AuthUtils authUtils;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;
    private final ICreditService creditService;
    private final ChatMapper chatMapper;

    @Override
    @Transactional
    public ChatSessionResponse createSession(CreateChatSessionRequest request) {
        User currentUser = authUtils.getCurrentUser();
        Job job = null;
        Cv cv = null;
        String title = "Chat Tư vấn mới";

        if (request.getJobId() != null) {
            job = jobService.getJobEntityById(request.getJobId());
            title = "Chat về công việc: " + job.getTitle();
        }

        if (request.getCvId() != null) {
            cv = cvService.getCvEntityById(request.getCvId());
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
        return chatMapper.toSessionResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getSessions() {
        User currentUser = authUtils.getCurrentUser();
        return chatSessionRepository.findByUserOrderByUpdatedAtDesc(currentUser).stream()
                .map(chatMapper::toSessionResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID sessionId) {
        ChatSession session = getSessionAndVerifyOwnership(sessionId);
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).stream()
                .map(chatMapper::toMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(UUID sessionId, SendChatMessageRequest request) {
        ChatSession session = getSessionAndVerifyOwnership(sessionId);
        User currentUser = authUtils.getCurrentUser();

        // 0. Deduct 5 AI Credits based on role
        if (currentUser.getRole().getName().equalsIgnoreCase("CANDIDATE")) {
            creditService.deductCandidateQuota(currentUser.getId(), "AI_CREDIT", 5);
        } else {
            creditService.deductCompanyFeatureQuota(currentUser.getId(), "AI_CREDIT", 5);
        }

        // 1. Lưu tin nhắn của User
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .sender(SenderType.USER)
                .content(request.getContent())
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Gọi RAG API
        List<String> documentIds = new ArrayList<>();
        if (session.getJob() != null) {
            documentIds.add(session.getJob().getId().toString());
        }
        if (session.getCv() != null) {
            documentIds.add(session.getCv().getId().toString());
        }

        RagChatResponseDto aiResponse = aiServiceClient.chatWithRag(request.getContent(), documentIds, 20);

        // 3. Lưu tin nhắn của AI
        String aiContent = aiResponse != null ? aiResponse.getAnswer()
                : "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.";
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

        session.setUpdatedAt(Instant.now());
        chatSessionRepository.save(session);

        return chatMapper.toMessageResponse(aiMessage);
    }



    @Override
    public SseEmitter sendMessageStream(UUID sessionId,
                                        SendChatMessageRequest request) {
        ChatSession session = getSessionAndVerifyOwnership(sessionId);
        User currentUser = authUtils.getCurrentUser();

        // 0. Deduct 5 AI Credits based on role
        if (currentUser.getRole().getName().equalsIgnoreCase("CANDIDATE")) {
            creditService.deductCandidateQuota(currentUser.getId(), "AI_CREDIT", 5);
        } else {
            creditService.deductCompanyFeatureQuota(currentUser.getId(), "AI_CREDIT", 5);
        }

        // 1. Lưu tin nhắn của User
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .sender(SenderType.USER)
                .content(request.getContent())
                .build();
        chatMessageRepository.save(userMessage);

        SseEmitter emitter = new SseEmitter(
                180000L); // 3 mins timeout

        List<String> documentIds = new ArrayList<>();
        if (session.getJob() != null) {
            documentIds.add(session.getJob().getId().toString());
        }
        if (session.getCv() != null) {
            documentIds.add(session.getCv().getId().toString());
        }

        UUID finalSessionId = session.getId();
        CompletableFuture.runAsync(() -> {
            try {
                InputStream is = aiServiceClient.chatWithRagStream(request.getContent(), documentIds, 20);
                StringBuilder fullResponseBuilder = new StringBuilder();

                try (Scanner scanner = new Scanner(is, "UTF-8")) {
                    while (scanner.hasNextLine()) {
                        String line = scanner.nextLine();
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6);
                            emitter.send(SseEmitter.event()
                                    .data(data));

                            try {
                                Map<String, Object> map = objectMapper.readValue(data, new TypeReference<Map<String, Object>>() {});
                                String text = (String) map.get("text");
                                if (text != null) {
                                    fullResponseBuilder.append(text);
                                }
                            } catch (JsonProcessingException e) {
                                throw new RuntimeException(e);
                            }
                        }
                    }
                }

                String fullAnswer = fullResponseBuilder.toString();
                if (fullAnswer.trim().isEmpty()) {
                    fullAnswer = "Xin lỗi, không nhận được phản hồi từ AI.";
                }

                // Save to database
                saveAiMessage(finalSessionId, fullAnswer);
                emitter.complete();
            } catch (Exception e) {
                log.error("Error during RAG chat stream", e);
                try {
                    emitter.send(SseEmitter.event().name("error")
                            .data("Lỗi RAG stream: " + e.getMessage()));
                } catch (Exception ignored) {
                }
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private ChatSession getSessionAndVerifyOwnership(UUID sessionId) {
        User currentUser = authUtils.getCurrentUser();
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.CHAT_SESSION_NOT_FOUND, "Chat session not found"));

        if (!session.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN_ACTION, "You don't have access to this chat session");
        }
        return session;
    }

    private void saveAiMessage(UUID sessionId, String content) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
        if (session != null) {
            ChatMessage aiMessage = ChatMessage.builder()
                    .session(session)
                    .sender(SenderType.AI)
                    .content(content)
                    .build();
            chatMessageRepository.save(aiMessage);

            session.setUpdatedAt(Instant.now());
            chatSessionRepository.save(session);
        }
    }
}
