package sba301.hrtech.system.dtos;

public record PublicSystemConfigResponse(
        String websiteName,
        Integer maxFileSize
) {}
