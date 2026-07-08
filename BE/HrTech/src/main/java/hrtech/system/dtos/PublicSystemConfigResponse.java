package hrtech.system.dtos;

public record PublicSystemConfigResponse(
        String websiteName,
        Integer maxFileSize
) {}
