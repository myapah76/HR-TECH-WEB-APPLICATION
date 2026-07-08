package sba301.hrtech.chat.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import sba301.hrtech.chat.dtos.response.ChatMessageResponse;
import sba301.hrtech.chat.dtos.response.ChatSessionResponse;
import sba301.hrtech.chat.entities.ChatMessage;
import sba301.hrtech.chat.entities.ChatSession;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "jobTitle")
    @Mapping(source = "cv.id", target = "cvId")
    ChatSessionResponse toSessionResponse(ChatSession session);

    ChatMessageResponse toMessageResponse(ChatMessage message);
}
