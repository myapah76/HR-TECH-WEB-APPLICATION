package sba301.hrtech.chat.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatResponseDto {
    private String answer;
    private List<RagCitationDto> citations;
}
