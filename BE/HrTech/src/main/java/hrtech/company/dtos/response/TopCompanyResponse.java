package hrtech.company.dtos.response;

import java.util.UUID;

public record TopCompanyResponse(
        UUID id,
        String name,
        String logoUrl,
        Long activeJobsCount
) {}
