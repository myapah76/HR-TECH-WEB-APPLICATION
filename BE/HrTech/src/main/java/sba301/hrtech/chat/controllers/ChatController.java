package sba301.hrtech.chat.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import sba301.hrtech.chat.abstractions.services.IChatService;
import sba301.hrtech.chat.dtos.request.CreateChatSessionRequest;
import sba301.hrtech.chat.dtos.request.SendChatMessageRequest;
import sba301.hrtech.chat.dtos.response.ChatMessageResponse;
import sba301.hrtech.chat.dtos.response.ChatSessionResponse;
import sba301.hrtech.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat/sessions")
@RequiredArgsConstructor
public class ChatController {

    private final IChatService chatService;

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('HR') or hasRole('HR_MANAGER')")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> createSession(
            @RequestBody CreateChatSessionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(chatService.createSession(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('HR') or hasRole('HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> getSessions() {
        return ResponseEntity.ok(ApiResponse.success(chatService.getSessions()));
    }

    @GetMapping("/{id}/messages")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('HR') or hasRole('HR_MANAGER')")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getMessages(id)));
    }

    @PostMapping("/{id}/messages")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('HR') or hasRole('HR_MANAGER')")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable UUID id,
            @RequestBody SendChatMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success(chatService.sendMessage(id, request)));
    }

    @PostMapping(value = "/{id}/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('HR') or hasRole('HR_MANAGER')")
    public SseEmitter sendMessageStream(
            @PathVariable UUID id,
            @RequestBody SendChatMessageRequest request) {
        return chatService.sendMessageStream(id, request);
    }
}
