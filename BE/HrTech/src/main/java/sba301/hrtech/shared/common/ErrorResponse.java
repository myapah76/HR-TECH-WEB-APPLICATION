package sba301.hrtech.shared.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String message;
    private String code;
    private Instant timestamp;
    private String path;
}


