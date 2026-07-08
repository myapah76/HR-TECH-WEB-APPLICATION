package hrtech.company.dtos.response;

import java.time.Instant;
import java.util.UUID;

public record CompanyMemberResponse(
        UUID id,
        UUID userId,
        String email,
        String firstName,
        String lastName,
        String role,
        String status,
        Instant createdAt
) {}

