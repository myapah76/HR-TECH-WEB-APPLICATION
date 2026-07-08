package hrtech.system.abstractions.services;

import hrtech.system.dtos.PublicSystemConfigResponse;
import hrtech.system.dtos.SystemConfigRequest;
import hrtech.system.dtos.SystemConfigResponse;
import hrtech.system.entities.SystemConfig;

public interface SystemConfigService {
    SystemConfig getSystemConfigEntity();
    SystemConfigResponse getSystemConfig();
    PublicSystemConfigResponse getPublicSystemConfig();
    SystemConfigResponse updateSystemConfig(SystemConfigRequest request);
}
