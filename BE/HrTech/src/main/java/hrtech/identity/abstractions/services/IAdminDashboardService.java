package hrtech.identity.abstractions.services;

import hrtech.identity.dtos.user.response.AdminDashboardSummaryResponse;

public interface IAdminDashboardService {
    AdminDashboardSummaryResponse getAdminDashboardSummary();
}
