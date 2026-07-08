package hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiMatchingAdviceResponseDto {
    private String improvement_tips;
    private List<String> action_plan;
}
