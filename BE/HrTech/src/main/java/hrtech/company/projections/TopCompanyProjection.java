package hrtech.company.projections;

import java.util.UUID;

public interface TopCompanyProjection {
    UUID getId();
    String getName();
    String getLogoUrl();
    Long getActiveJobsCount();
}
