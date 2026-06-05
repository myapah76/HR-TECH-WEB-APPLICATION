package sba301.hrtech.auth.dtos.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class EmailActionResponse {
    private String email;
    private int expireIn;
}