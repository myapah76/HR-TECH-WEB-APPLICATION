package hrtech.chat.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagCitationDto {
    private int chunk_index;
    private double distance;
    private String text;
    private Map<String, Object> metadata;
}
