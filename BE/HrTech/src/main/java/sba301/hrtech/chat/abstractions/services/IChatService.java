package sba301.hrtech.chat.abstractions.services;

import sba301.hrtech.chat.dtos.request.CreateChatSessionRequest;
import sba301.hrtech.chat.dtos.request.SendChatMessageRequest;
import sba301.hrtech.chat.dtos.response.ChatMessageResponse;
import sba301.hrtech.chat.dtos.response.ChatSessionResponse;

import java.util.List;
import java.util.UUID;

public interface IChatService {
    ChatSessionResponse createSession(CreateChatSessionRequest request);
    List<ChatSessionResponse> getSessions();
    List<ChatMessageResponse> getMessages(UUID sessionId);
    ChatMessageResponse sendMessage(UUID sessionId, SendChatMessageRequest request);
}
