package com.planbook.controller;

import com.planbook.entity.Curriculum;
import com.planbook.service.CurriculumService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/curriculums")
public class CurriculumController {

    private final CurriculumService curriculumService;

    public CurriculumController(CurriculumService curriculumService) {
        this.curriculumService = curriculumService;
    }

    // GET /api/curriculums → lấy danh sách
    @GetMapping
    public ResponseEntity<List<Curriculum>> getAllCurriculums() {
        List<Curriculum> list = curriculumService.getAllCurriculums();
        if (list.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.ok(list); // 200 OK
    }

    // GET /api/curriculums/{id} → lấy theo id
    @GetMapping("/{id}")
    public ResponseEntity<Curriculum> getCurriculumById(@PathVariable Long id) {
        return curriculumService.getCurriculumById(id)
                .map(ResponseEntity::ok) // 200 OK
                .orElse(ResponseEntity.notFound().build()); // 404 Not Found
    }

    // POST /api/curriculums → thêm mới
    @PostMapping
    public ResponseEntity<Curriculum> addCurriculum(@Valid @RequestBody Curriculum curriculum) {
        if (curriculum.getStartDate().isAfter(curriculum.getEndDate())) {
            return ResponseEntity.badRequest().build(); // 400 Bad Request
        }
        Curriculum saved = curriculumService.addCurriculum(curriculum);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved); // 201 Created
    }

    // PUT /api/curriculums/{id} → cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<Curriculum> updateCurriculum(@PathVariable Long id,
                                                       @Valid @RequestBody Curriculum curriculumDetails) {
        Curriculum updated = curriculumService.updateCurriculum(id, curriculumDetails);
        return ResponseEntity.ok(updated); // 200 OK
    }

    // DELETE /api/curriculums/{id} → xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurriculum(@PathVariable Long id) {
        curriculumService.deleteCurriculum(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}

