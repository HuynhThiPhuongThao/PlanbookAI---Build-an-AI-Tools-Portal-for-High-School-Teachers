package com.planbook.entity.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    private Long id = 1L;

    @Column(name = "ai_model")
    private String aiModel = "gemini-2.5-flash";

    @Column(name = "ai_temperature")
    private Double aiTemperature = 0.7;

    @Column(name = "ai_max_tokens")
    private Integer aiMaxTokens = 2048;

    @Column(name = "allow_teacher_register")
    private Boolean allowTeacherRegister = true;

    @Column(name = "max_lesson_plans_per_day")
    private Integer maxLessonPlansPerDay = 10;

    @Column(name = "max_questions_per_day")
    private Integer maxQuestionsPerDay = 50;

    @Column(name = "system_banner", columnDefinition = "TEXT")
    private String systemBanner = "";

    @Column(name = "banner_audience")
    private String bannerAudience = "ALL";

    @Column(name = "banner_enabled")
    private Boolean bannerEnabled = false;

    @Column(name = "maintenance_mode")
    private Boolean maintenanceMode = false;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

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
