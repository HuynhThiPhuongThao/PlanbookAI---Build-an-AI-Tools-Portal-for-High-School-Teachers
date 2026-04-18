package com.planbook.question_bank_service.controller;

import com.planbook.question_bank_service.dto.ApiResponse;
import com.planbook.question_bank_service.dto.PaginatedResponse;
import com.planbook.question_bank_service.dto.QuestionRequestDTO;
import com.planbook.question_bank_service.dto.QuestionResponseDTO;
import com.planbook.question_bank_service.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/questions")
public class QuestionController {
    
    private final QuestionService questionService;
    
    // Constructor injection (thay thế cho @RequiredArgsConstructor)
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }
    
    // GET: /api/questions - Xem danh sách câu hỏi (phân trang + filter)
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<QuestionResponseDTO>>> getAllQuestions(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        PaginatedResponse<QuestionResponseDTO> response = questionService.getAllQuestions(
                subject, topic, difficultyLevel, keyword, page, size, sortBy);
        
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách câu hỏi thành công"));
    }
    
    // GET: /api/questions/pending - Manager xem câu hỏi chờ duyệt
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PaginatedResponse<QuestionResponseDTO>>> getPendingQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PaginatedResponse<QuestionResponseDTO> response = questionService.getPendingQuestionsForManager(page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách câu hỏi chờ duyệt thành công"));
    }
    
    // GET: /api/questions/{id} - Xem chi tiết câu hỏi
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> getQuestionById(@PathVariable Long id) {
        QuestionResponseDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(question, "Lấy thông tin câu hỏi thành công"));
    }
    
    // POST: /api/questions - Tạo câu hỏi mới
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> createQuestion(
            @Valid @RequestBody QuestionRequestDTO request) {
        
        QuestionResponseDTO createdQuestion = questionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdQuestion, "Tạo câu hỏi thành công, đang chờ duyệt"));
    }
    
    // PUT: /api/questions/{id} - Cập nhật câu hỏi (chỉ tác giả, chỉ khi PENDING)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequestDTO request) {
        
        QuestionResponseDTO updatedQuestion = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedQuestion, "Cập nhật câu hỏi thành công"));
    }
    
    // DELETE: /api/questions/{id} - Xóa câu hỏi (chỉ ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa câu hỏi thành công"));
    }
    
    // POST: /api/questions/{id}/approve - Duyệt câu hỏi (chỉ MANAGER)
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> approveQuestion(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        
        boolean approved = body != null && "true".equals(body.get("approved"));
        String rejectionReason = body != null ? body.get("rejectionReason") : null;
        
        QuestionResponseDTO approvedQuestion = questionService.approveQuestion(id, approved, rejectionReason);
        String message = approved ? "Duyệt câu hỏi thành công" : "Từ chối câu hỏi thành công";
        return ResponseEntity.ok(ApiResponse.success(approvedQuestion, message));
    }
}