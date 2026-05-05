package com.planbook.controller.admin;

import com.planbook.dto.admin.SystemConfigRequest;
import com.planbook.dto.admin.SystemConfigPublicResponse;
import com.planbook.dto.admin.SystemConfigResponse;
import com.planbook.security.AuthUtil;
import com.planbook.service.admin.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system-config")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;
    private final AuthUtil authUtil;

    public SystemConfigController(SystemConfigService systemConfigService, AuthUtil authUtil) {
        this.systemConfigService = systemConfigService;
        this.authUtil = authUtil;
    }

    @GetMapping
    public ResponseEntity<SystemConfigResponse> getConfig() {
        return ResponseEntity.ok(systemConfigService.getConfig());
    }

    @GetMapping("/public")
    public ResponseEntity<SystemConfigPublicResponse> getPublicConfig() {
        return ResponseEntity.ok(systemConfigService.getPublicConfig());
    }

    @PutMapping
    public ResponseEntity<SystemConfigResponse> updateConfig(@RequestBody SystemConfigRequest request,
                                                             Authentication authentication) {
        Long adminId = authUtil.extractAdminId(authentication);
        return ResponseEntity.ok(systemConfigService.updateConfig(request, adminId));
    }
}
