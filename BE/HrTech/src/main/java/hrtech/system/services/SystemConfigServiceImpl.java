package hrtech.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import hrtech.shared.error.ErrorCode;
import hrtech.shared.exceptions.AppException;
import hrtech.system.abstractions.repositories.SystemConfigRepository;
import hrtech.system.abstractions.services.SystemConfigService;
import hrtech.system.dtos.PublicSystemConfigResponse;
import hrtech.system.dtos.SystemConfigRequest;
import hrtech.system.dtos.SystemConfigResponse;
import hrtech.system.entities.SystemConfig;
import hrtech.system.mapper.SystemConfigMapper;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    private final SystemConfigMapper systemConfigMapper;

    @Override
    @Cacheable(value = "systemConfig")
    @Transactional(readOnly = true)
    public SystemConfig getSystemConfigEntity() {
        return getActiveConfig();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfigResponse getSystemConfig() {
        SystemConfig config = getActiveConfig();
        String dbSize = "Không xác định";
        boolean dbOnline;
        try {
            dbSize = systemConfigRepository.getDatabaseSize();
            dbOnline = true;
        } catch (Exception e) {
            dbOnline = false;
        }
        return systemConfigMapper.toResponse(config, dbOnline, dbSize);
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    @Transactional
    public SystemConfigResponse updateSystemConfig(SystemConfigRequest request) {
        SystemConfig config = getActiveConfig();
        systemConfigMapper.updateEntityFromRequest(request, config);

        String dbSize = "Không xác định";
        boolean dbOnline;
        try {
            dbSize = systemConfigRepository.getDatabaseSize();
            dbOnline = true;
        } catch (Exception e) {
            dbOnline = false;
        }
        return systemConfigMapper.toResponse(config, dbOnline, dbSize);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicSystemConfigResponse getPublicSystemConfig() {
        SystemConfig config = getActiveConfig();
        return new PublicSystemConfigResponse(
                config.getWebsiteName(),
                config.getMaxFileSize()
        );
    }

    private SystemConfig getActiveConfig() {
        return systemConfigRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_CONFIG_NOT_INITIALIZED));
    }
}
