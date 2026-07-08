package hrtech.chat.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import hrtech.chat.dtos.response.ChatMessageResponse;
import hrtech.chat.dtos.response.ChatSessionResponse;
import hrtech.chat.entities.ChatMessage;
import hrtech.chat.entities.ChatSession;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "cv.id", target = "cvId")
    ChatSessionResponse toSessionResponse(ChatSession session);

    ChatMessageResponse toMessageResponse(ChatMessage message);
}
