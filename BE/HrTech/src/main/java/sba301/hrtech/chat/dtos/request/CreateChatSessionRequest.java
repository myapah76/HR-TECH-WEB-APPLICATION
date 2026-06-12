package sba301.hrtech.chat.dtos.request;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateChatSessionRequest {
    private UUID jobId;
    private UUID cvId;
}
