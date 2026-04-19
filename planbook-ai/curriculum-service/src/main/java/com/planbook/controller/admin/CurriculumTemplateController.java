package com.planbook.controller.admin;

import com.planbook.dto.admin.CurriculumTemplateRequest;
import com.planbook.dto.admin.CurriculumTemplateResponse;
import com.planbook.service.admin.CurriculumTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curriculum-templates")
public class CurriculumTemplateController {

    private final CurriculumTemplateService curriculumTemplateService;

    public CurriculumTemplateController(CurriculumTemplateService curriculumTemplateService) {
        this.curriculumTemplateService = curriculumTemplateService;
    }

    @PostMapping
    public ResponseEntity<CurriculumTemplateResponse> createTemplate(
            @RequestBody CurriculumTemplateRequest request
    ) {
        // Tạm fix cứng adminId = 1 để test trước
        // Sau này lấy từ security context
        Long adminId = 1L;
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
            @RequestBody CurriculumTemplateRequest request
    ) {
        Long adminId = 1L;
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
