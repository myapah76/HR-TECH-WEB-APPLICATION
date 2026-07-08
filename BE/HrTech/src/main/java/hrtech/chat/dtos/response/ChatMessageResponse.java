package hrtech.chat.dtos.response;

import lombok.Builder;
import lombok.Data;
import hrtech.chat.enums.SenderType;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ChatMessageResponse {
    private UUID id;
    private SenderType sender;
    private String content;
    private String citations;
    private Instant createdAt;
}
