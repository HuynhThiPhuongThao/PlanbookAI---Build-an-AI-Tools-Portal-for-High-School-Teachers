package com.planbook.dto.admin;

import java.time.LocalDateTime;

public class SystemConfigResponse {
    private String aiModel;
    private Double aiTemperature;
    private Integer aiMaxTokens;
    private Boolean allowTeacherRegister;
    private Integer maxLessonPlansPerDay;
    private Integer maxQuestionsPerDay;
    private String systemBanner;
    private String bannerAudience;
    private Boolean bannerEnabled;
    private Boolean maintenanceMode;
    private Long updatedBy;
    private LocalDateTime updatedAt;

    public String getAiModel() {
        return aiModel;
    }

    public void setAiModel(String aiModel) {
        this.aiModel = aiModel;
    }

    public Double getAiTemperature() {
        return aiTemperature;
    }

    public void setAiTemperature(Double aiTemperature) {
        this.aiTemperature = aiTemperature;
    }

    public Integer getAiMaxTokens() {
        return aiMaxTokens;
    }

    public void setAiMaxTokens(Integer aiMaxTokens) {
        this.aiMaxTokens = aiMaxTokens;
    }

    public Boolean getAllowTeacherRegister() {
        return allowTeacherRegister;
    }

    public void setAllowTeacherRegister(Boolean allowTeacherRegister) {
        this.allowTeacherRegister = allowTeacherRegister;
    }

    public Integer getMaxLessonPlansPerDay() {
        return maxLessonPlansPerDay;
    }

    public void setMaxLessonPlansPerDay(Integer maxLessonPlansPerDay) {
        this.maxLessonPlansPerDay = maxLessonPlansPerDay;
    }

    public Integer getMaxQuestionsPerDay() {
        return maxQuestionsPerDay;
    }

    public void setMaxQuestionsPerDay(Integer maxQuestionsPerDay) {
        this.maxQuestionsPerDay = maxQuestionsPerDay;
    }

    public String getSystemBanner() {
        return systemBanner;
    }

    public void setSystemBanner(String systemBanner) {
        this.systemBanner = systemBanner;
    }

    public String getBannerAudience() {
        return bannerAudience;
    }

    public void setBannerAudience(String bannerAudience) {
        this.bannerAudience = bannerAudience;
    }

    public Boolean getBannerEnabled() {
        return bannerEnabled;
    }

    public void setBannerEnabled(Boolean bannerEnabled) {
        this.bannerEnabled = bannerEnabled;
    }

    public Boolean getMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(Boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
