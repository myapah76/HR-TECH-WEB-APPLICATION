package sba301.hrtech.shared.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String message;
    private String code;
    private OffsetDateTime timestamp;
    private String path;
}
