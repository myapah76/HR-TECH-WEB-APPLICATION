package hrtech.chat.dtos.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ChatSessionResponse {
    private UUID id;
    private String title;
    private UUID jobId;
    private String jobTitle;
    private UUID cvId;
    private Instant createdAt;
}
