package hrtech.chat.abstractions.services;

import hrtech.chat.dtos.request.CreateChatSessionRequest;
import hrtech.chat.dtos.request.SendChatMessageRequest;
import hrtech.chat.dtos.response.ChatMessageResponse;
import hrtech.chat.dtos.response.ChatSessionResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

public interface IChatService {
    ChatSessionResponse createSession(CreateChatSessionRequest request);

    List<ChatSessionResponse> getSessions();

    List<ChatMessageResponse> getMessages(UUID sessionId);

    ChatMessageResponse sendMessage(UUID sessionId, SendChatMessageRequest request);

    SseEmitter sendMessageStream(UUID sessionId, SendChatMessageRequest request);
}
