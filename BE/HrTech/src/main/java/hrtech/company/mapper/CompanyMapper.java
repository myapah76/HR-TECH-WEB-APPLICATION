package hrtech.company.mapper;

import org.mapstruct.*;
import hrtech.company.dtos.request.CompanyRegisterRequest;
import hrtech.company.dtos.request.CompanyUpdateRequest;
import hrtech.company.dtos.response.CompanyMemberResponse;
import hrtech.company.dtos.response.CompanyResponse;
import hrtech.company.entities.Company;
import hrtech.company.entities.CompanyMember;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface CompanyMapper {

    @Mapping(target = "size", expression = "java(company.getSize() != null ? company.getSize().name() : null)")
    @Mapping(target = "status", expression = "java(company.getStatus() != null ? company.getStatus().name() : null)")
    @Mapping(target = "isDeleted", source = "deleted")
    CompanyResponse toResponse(Company company);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "taxCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "jobs", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "size", ignore = true)
    @Mapping(target = "relatedWeight", ignore = true)
    @Mapping(target = "parentOfWeight", ignore = true)
    Company fromRegisterRequest(CompanyRegisterRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "taxCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    @Mapping(target = "jobs", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "size", ignore = true)
    @Mapping(target = "relatedWeight", ignore = true)
    @Mapping(target = "parentOfWeight", ignore = true)
    void updateCompanyFromDto(CompanyUpdateRequest request, @MappingTarget Company company);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "role", expression = "java(member.getCompanyRole() != null ? member.getCompanyRole().name() : null)")
    @Mapping(target = "status", expression = "java(member.getMembershipStatus() != null ? member.getMembershipStatus().name() : null)")
    CompanyMemberResponse toMemberResponse(CompanyMember member);
}
