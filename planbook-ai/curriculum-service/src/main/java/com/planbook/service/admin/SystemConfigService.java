package com.planbook.service.admin;

import com.planbook.dto.admin.SystemConfigRequest;
import com.planbook.dto.admin.SystemConfigPublicResponse;
import com.planbook.dto.admin.SystemConfigResponse;
import com.planbook.entity.admin.SystemConfig;
import com.planbook.repository.admin.SystemConfigRepository;
import com.planbook.service.FirebaseNotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@Service
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final FirebaseNotificationService firebaseNotificationService;
    private final RestTemplate restTemplate;

    @Value("${user-service.internal-url:http://user-service:8082}")
    private String userServiceUrl;

    public SystemConfigService(SystemConfigRepository systemConfigRepository,
                               FirebaseNotificationService firebaseNotificationService,
                               RestTemplate restTemplate) {
        this.systemConfigRepository = systemConfigRepository;
        this.firebaseNotificationService = firebaseNotificationService;
        this.restTemplate = restTemplate;
    }

    public SystemConfigResponse getConfig() {
        return toResponse(getOrCreate());
    }

    public SystemConfigPublicResponse getPublicConfig() {
        SystemConfig config = getOrCreate();
        SystemConfigPublicResponse response = new SystemConfigPublicResponse();
        response.setAllowTeacherRegister(config.getAllowTeacherRegister());
        response.setSystemBanner(config.getSystemBanner());
        response.setBannerAudience(normalizeBannerAudience(config.getBannerAudience()));
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
        config.setBannerAudience(normalizeBannerAudience(request.getBannerAudience()));
        config.setBannerEnabled(request.getBannerEnabled());
        config.setMaintenanceMode(request.getMaintenanceMode());
        config.setUpdatedBy(adminId);
        config.setUpdatedAt(LocalDateTime.now());
        SystemConfig savedConfig = systemConfigRepository.save(config);
        broadcastSystemConfigUpdate(savedConfig);
        return toResponse(savedConfig);
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
        response.setBannerAudience(normalizeBannerAudience(config.getBannerAudience()));
        response.setBannerEnabled(config.getBannerEnabled());
        response.setMaintenanceMode(config.getMaintenanceMode());
        response.setUpdatedBy(config.getUpdatedBy());
        response.setUpdatedAt(config.getUpdatedAt());
        return response;
    }

    private String normalizeBannerAudience(String audience) {
        return "INTERNAL".equalsIgnoreCase(audience) ? "INTERNAL" : "ALL";
    }

    private void broadcastSystemConfigUpdate(SystemConfig config) {
        try {
            String tokenPath = "/api/users/internal/fcm-tokens";
            String[] tokens = restTemplate.getForObject(userServiceUrl + tokenPath, String[].class);
            List<String> targetTokens = tokens == null ? List.of() : Arrays.asList(tokens);

            String body = Boolean.TRUE.equals(config.getBannerEnabled()) && config.getSystemBanner() != null && !config.getSystemBanner().isBlank()
                    ? config.getSystemBanner()
                    : "Cấu hình hệ thống đã thay đổi.";

            firebaseNotificationService.sendNotificationToMany(
                    targetTokens,
                    "Thông báo hệ thống",
                    body,
                    FirebaseNotificationService.TYPE_SYSTEM_CONFIG_UPDATED,
                    Map.of(
                            "systemBanner", config.getSystemBanner() == null ? "" : config.getSystemBanner(),
                            "bannerEnabled", String.valueOf(Boolean.TRUE.equals(config.getBannerEnabled())),
                            "bannerAudience", normalizeBannerAudience(config.getBannerAudience()),
                            "maintenanceMode", String.valueOf(Boolean.TRUE.equals(config.getMaintenanceMode())),
                            "allowTeacherRegister", String.valueOf(Boolean.TRUE.equals(config.getAllowTeacherRegister()))
                    )
            );
        } catch (Exception e) {
            System.err.println("[Firebase FCM] Cannot broadcast system config update: " + e.getMessage());
        }
    }
}
