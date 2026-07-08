package hrtech.identity.mapper;

import org.mapstruct.*;
import hrtech.identity.entities.User;
import hrtech.identity.dtos.user.request.CreateUserRequest;
import hrtech.identity.dtos.user.request.UserCommonRequest;
import hrtech.identity.dtos.user.response.UserResponse;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {

    @Mapping(target = "roleResponse", source = "role")
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "isBlocked", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "cvs", ignore = true)
    @Mapping(target = "applications", ignore = true)
    @Mapping(target = "candidateSubscriptions", ignore = true)
    @Mapping(target = "companyPurchasedSubscriptions", ignore = true)
    @Mapping(target = "firstName", source = "userCommonRequest.firstName")
    @Mapping(target = "lastName", source = "userCommonRequest.lastName")
    @Mapping(target = "email", source = "userCommonRequest.email")
    @Mapping(target = "username", source = "userCommonRequest.username")
    @Mapping(target = "phone", source = "userCommonRequest.phone")
    @Mapping(target = "address", source = "userCommonRequest.address")
    @Mapping(target = "gender", source = "userCommonRequest.gender")
    @Mapping(target = "dateOfBirth", source = "userCommonRequest.dateOfBirth")
    @Mapping(target = "avatarUrl", source = "userCommonRequest.avatarUrl")
    @Mapping(target = "avatarPublicId", source = "userCommonRequest.avatarPublicId")
    User fromCreateRequest(CreateUserRequest request);

    // Chỉ map field đơn giản, Role set thủ công ở Service
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "cvs", ignore = true)
    @Mapping(target = "applications", ignore = true)
    @Mapping(target = "candidateSubscriptions", ignore = true)
    @Mapping(target = "companyPurchasedSubscriptions", ignore = true)
    void updateUserFromRequest(UserCommonRequest request, @MappingTarget User user);
}
