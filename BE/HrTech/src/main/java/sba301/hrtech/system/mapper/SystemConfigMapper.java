package sba301.hrtech.system.mapper;

import org.mapstruct.*;
import sba301.hrtech.system.dtos.SystemConfigRequest;
import sba301.hrtech.system.dtos.SystemConfigResponse;
import sba301.hrtech.system.entities.SystemConfig;

@Mapper(componentModel = "spring")
public interface SystemConfigMapper {

    @Mapping(target = "id", source = "config.id")
    @Mapping(target = "dbOnline", source = "dbOnline")
    @Mapping(target = "dbSize", source = "dbSize")
    SystemConfigResponse toResponse(SystemConfig config, boolean dbOnline, String dbSize);

    void updateEntityFromRequest(SystemConfigRequest request, @MappingTarget SystemConfig config);
}