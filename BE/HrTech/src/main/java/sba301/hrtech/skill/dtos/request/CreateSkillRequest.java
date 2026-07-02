package sba301.hrtech.skill.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSkillRequest {

    @NotBlank(message = "Skill name is required")
    private String name;

    private String description;

    @NotEmpty(message = "Kỹ năng mới bắt buộc phải thuộc ít nhất 1 vai trò")
    private List<String> roles;
}
