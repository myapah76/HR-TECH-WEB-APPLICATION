package sba301.hrtech.auth.mapper;

import org.mapstruct.*;
import sba301.hrtech.auth.entities.Role;
import sba301.hrtech.auth.dtos.role.request.CommonRoleRequest;
import sba301.hrtech.auth.dtos.role.request.CreateRoleRequest;
import sba301.hrtech.auth.dtos.role.response.RoleResponse;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toResponse(Role role);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "name", source = "commonRoleRequest.name")
    @Mapping(target = "description", source = "commonRoleRequest.description")
    Role fromCreateRequest(CreateRoleRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateRoleFromRequest(CommonRoleRequest request, @MappingTarget Role role);
}
