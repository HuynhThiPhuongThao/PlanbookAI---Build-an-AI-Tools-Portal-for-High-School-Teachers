package com.planbook.service.admin;

import com.planbook.dto.admin.SystemConfigRequest;
import com.planbook.dto.admin.SystemConfigPublicResponse;
import com.planbook.dto.admin.SystemConfigResponse;
import com.planbook.entity.admin.SystemConfig;
import com.planbook.repository.admin.SystemConfigRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigService(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    public SystemConfigResponse getConfig() {
        return toResponse(getOrCreate());
    }

    public SystemConfigPublicResponse getPublicConfig() {
        SystemConfig config = getOrCreate();
        SystemConfigPublicResponse response = new SystemConfigPublicResponse();
        response.setAllowTeacherRegister(config.getAllowTeacherRegister());
        response.setSystemBanner(config.getSystemBanner());
        response.setBannerEnabled(config.getBannerEnabled());
        response.setMaintenanceMode(config.getMaintenanceMode());
        return response;
    }

    public SystemConfigResponse updateConfig(SystemConfigRequest request, Long adminId) {
        SystemConfig config = getOrCreate();
        config.setAiModel(request.getAiModel());
        config.setAiTemperature(request.getAiTemperature());
        config.setAiMaxTokens(request.getAiMaxTokens());
        config.setAllowTeacherRegister(request.getAllowTeacherRegister());
        config.setMaxLessonPlansPerDay(request.getMaxLessonPlansPerDay());
        config.setMaxQuestionsPerDay(request.getMaxQuestionsPerDay());
        config.setSystemBanner(request.getSystemBanner());
        config.setBannerEnabled(request.getBannerEnabled());
        config.setMaintenanceMode(request.getMaintenanceMode());
        config.setUpdatedBy(adminId);
        config.setUpdatedAt(LocalDateTime.now());
        return toResponse(systemConfigRepository.save(config));
    }

    private SystemConfig getOrCreate() {
        return systemConfigRepository.findById(1L).orElseGet(() -> systemConfigRepository.save(new SystemConfig()));
    }

    private SystemConfigResponse toResponse(SystemConfig config) {
        SystemConfigResponse response = new SystemConfigResponse();
        response.setAiModel(config.getAiModel());
        response.setAiTemperature(config.getAiTemperature());
        response.setAiMaxTokens(config.getAiMaxTokens());
        response.setAllowTeacherRegister(config.getAllowTeacherRegister());
        response.setMaxLessonPlansPerDay(config.getMaxLessonPlansPerDay());
        response.setMaxQuestionsPerDay(config.getMaxQuestionsPerDay());
        response.setSystemBanner(config.getSystemBanner());
        response.setBannerEnabled(config.getBannerEnabled());
        response.setMaintenanceMode(config.getMaintenanceMode());
        response.setUpdatedBy(config.getUpdatedBy());
        response.setUpdatedAt(config.getUpdatedAt());
        return response;
    }
}
