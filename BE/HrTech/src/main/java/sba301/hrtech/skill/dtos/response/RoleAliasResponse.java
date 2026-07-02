package sba301.hrtech.skill.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleAliasResponse {
    private UUID id;
    private String alias;
    private String canonicalRole;
}
