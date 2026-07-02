package sba301.hrtech.system.abstractions.services;

import sba301.hrtech.system.dtos.SystemConfigRequest;
import sba301.hrtech.system.dtos.SystemConfigResponse;
import sba301.hrtech.system.entities.SystemConfig;

public interface SystemConfigService {
    SystemConfig getSystemConfigEntity();
    SystemConfigResponse getSystemConfig();
    SystemConfigResponse updateSystemConfig(SystemConfigRequest request);
}
