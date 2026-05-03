package com.planbook.dto.admin;

public class SystemConfigPublicResponse {
    private Boolean allowTeacherRegister;
    private String systemBanner;
    private Boolean bannerEnabled;
    private Boolean maintenanceMode;

    public Boolean getAllowTeacherRegister() {
        return allowTeacherRegister;
    }

    public void setAllowTeacherRegister(Boolean allowTeacherRegister) {
        this.allowTeacherRegister = allowTeacherRegister;
    }

    public String getSystemBanner() {
        return systemBanner;
    }

    public void setSystemBanner(String systemBanner) {
        this.systemBanner = systemBanner;
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
}
