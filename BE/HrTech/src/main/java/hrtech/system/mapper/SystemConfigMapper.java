package hrtech.system.mapper;

import org.mapstruct.*;
import hrtech.system.dtos.SystemConfigRequest;
import hrtech.system.dtos.SystemConfigResponse;
import hrtech.system.entities.SystemConfig;

@Mapper(componentModel = "spring")
public interface SystemConfigMapper {

    @Mapping(target = "id", source = "config.id")
    @Mapping(target = "dbOnline", source = "dbOnline")
    @Mapping(target = "dbSize", source = "dbSize")
    SystemConfigResponse toResponse(SystemConfig config, boolean dbOnline, String dbSize);

    void updateEntityFromRequest(SystemConfigRequest request, @MappingTarget SystemConfig config);
}