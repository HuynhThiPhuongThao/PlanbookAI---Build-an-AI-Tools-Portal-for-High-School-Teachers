package com.planbook.controller.admin;

import com.planbook.dto.admin.CurriculumTemplateRequest;
import com.planbook.dto.admin.CurriculumTemplateResponse;
import com.planbook.security.AuthUtil;
import com.planbook.service.admin.CurriculumTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curriculum-templates")
public class CurriculumTemplateController {

    private final CurriculumTemplateService curriculumTemplateService;
    private final AuthUtil authUtil;

    public CurriculumTemplateController(CurriculumTemplateService curriculumTemplateService, AuthUtil authUtil) {
        this.curriculumTemplateService = curriculumTemplateService;
        this.authUtil = authUtil;
    }

    @PostMapping
    public ResponseEntity<CurriculumTemplateResponse> createTemplate(
            @RequestBody CurriculumTemplateRequest request,
            Authentication authentication
    ) {
        Long adminId = authUtil.extractAdminId(authentication);
        return ResponseEntity.ok(curriculumTemplateService.createTemplate(request, adminId));
    }

    @GetMapping
    public ResponseEntity<List<CurriculumTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(curriculumTemplateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurriculumTemplateResponse> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(curriculumTemplateService.getTemplateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CurriculumTemplateResponse> updateTemplate(
            @PathVariable Long id,
            @RequestBody CurriculumTemplateRequest request,
            Authentication authentication
    ) {
        Long adminId = authUtil.extractAdminId(authentication);
        return ResponseEntity.ok(curriculumTemplateService.updateTemplate(id, request, adminId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTemplate(@PathVariable Long id) {
        curriculumTemplateService.deleteTemplate(id);
        return ResponseEntity.ok("Deleted curriculum template successfully");
    }

    @GetMapping("/active")
    public ResponseEntity<List<CurriculumTemplateResponse>> getActiveTemplates() {
        return ResponseEntity.ok(curriculumTemplateService.getActiveTemplates());
    }
}
