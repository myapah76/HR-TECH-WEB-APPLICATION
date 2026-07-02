package sba301.hrtech.system.abstractions.services;

import sba301.hrtech.system.dtos.SystemConfigRequest;
import sba301.hrtech.system.dtos.SystemConfigResponse;
import sba301.hrtech.system.entities.SystemConfig;

public interface SystemConfigService {
    // Đọc cấu hình (dùng cho các Service nghiệp vụ ở BE)
    SystemConfig getSystemConfigEntity();
    // Lấy cấu hình đầy đủ (dùng cho trang Admin)
    SystemConfigResponse getSystemConfig();
    // Cập nhật cấu hình
    SystemConfigResponse updateSystemConfig(SystemConfigRequest request);
}
