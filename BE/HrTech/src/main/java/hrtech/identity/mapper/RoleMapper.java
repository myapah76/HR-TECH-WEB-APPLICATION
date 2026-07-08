package hrtech.identity.mapper;

import org.mapstruct.*;
import hrtech.identity.entities.Role;
import hrtech.identity.dtos.role.request.CommonRoleRequest;
import hrtech.identity.dtos.role.request.CreateRoleRequest;
import hrtech.identity.dtos.role.response.RoleResponse;

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
