package com.planbook.question_bank_service.controller;

import com.planbook.question_bank_service.dto.ApiResponse;
import com.planbook.question_bank_service.dto.*;
import com.planbook.question_bank_service.service.AiQuestionService;
import com.planbook.question_bank_service.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Questions", description = "API quản lý câu hỏi trắc nghiệm")
@RestController
@RequestMapping("/questions")
public class QuestionController {
    
    private final QuestionService questionService;
    private final AiQuestionService aiQuestionService;
    
    public QuestionController(QuestionService questionService, AiQuestionService aiQuestionService) {
        this.questionService = questionService;
        this.aiQuestionService = aiQuestionService;
    }
    
    // GET: /api/questions - Xem danh sách câu hỏi (phân trang + filter)
    @Operation(summary = "Lấy danh sách câu hỏi", description = "Xem danh sách câu hỏi với phân trang, filter theo môn/chương/độ khó")
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
    @Operation(summary = "Xem câu hỏi chờ duyệt", description = "Dành riêng cho Manager để xem các câu hỏi đang ở trạng thái PENDING")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PaginatedResponse<QuestionResponseDTO>>> getPendingQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PaginatedResponse<QuestionResponseDTO> response = questionService.getPendingQuestionsForManager(page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách câu hỏi chờ duyệt thành công"));
    }
    
    // GET: /api/questions/{id} - Xem chi tiết câu hỏi
    @Operation(summary = "Xem chi tiết câu hỏi", description = "Lấy thông tin chi tiết một câu hỏi theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> getQuestionById(@PathVariable Long id) {
        QuestionResponseDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(question, "Lấy thông tin câu hỏi thành công"));
    }
    
    // POST: /api/questions - Tạo câu hỏi mới
    @Operation(summary = "Tạo câu hỏi mới", description = "Chỉ Teacher và Staff có quyền. Câu hỏi mới có status=PENDING (chờ Manager duyệt)")
    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> createQuestion(
            @Valid @RequestBody QuestionRequestDTO request) {
        
        QuestionResponseDTO createdQuestion = questionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdQuestion, "Tạo câu hỏi thành công, đang chờ duyệt"));
    }
    
    // PUT: /api/questions/{id} - Cập nhật câu hỏi (chỉ tác giả, chỉ khi PENDING)
    @Operation(summary = "Cập nhật câu hỏi", description = "Chỉ tác giả được cập nhật và chỉ khi câu hỏi đang ở trạng thái PENDING")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponseDTO>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequestDTO request) {
        
        QuestionResponseDTO updatedQuestion = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success(updatedQuestion, "Cập nhật câu hỏi thành công"));
    }
    
    // DELETE: /api/questions/{id} - Xóa câu hỏi (chỉ ADMIN)
    @Operation(summary = "Xóa câu hỏi", description = "Chỉ ADMIN được quyền xóa câu hỏi")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa câu hỏi thành công"));
    }
    
    // POST: /api/questions/{id}/approve - Duyệt câu hỏi (chỉ MANAGER)
    @Operation(summary = "Duyệt hoặc từ chối câu hỏi", description = "Chỉ MANAGER có quyền duyệt hoặc từ chối câu hỏi đang chờ")
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
    
    // 📌 NEW: AI hỗ trợ tạo câu hỏi
    @Operation(summary = "AI gợi ý câu hỏi", description = "Sử dụng AI để sinh đề câu hỏi dựa trên chủ đề và độ khó")
    @PostMapping("/ai/suggest")
    public ResponseEntity<ApiResponse<QuestionSuggestionDTO>> suggestQuestion(
            @Valid @RequestBody QuestionSuggestionRequest request) {
        
        QuestionSuggestionDTO suggestion = aiQuestionService.suggestQuestion(request);
        return ResponseEntity.ok(ApiResponse.success(suggestion, "AI đã gợi ý câu hỏi thành công"));
    }

    // 📌 NEW: AI hỗ trợ cải thiện câu hỏi
    @Operation(summary = "AI cải thiện câu hỏi", description = "Sử dụng AI để đánh giá và đưa ra bản cải thiện cho câu hỏi")
    @PostMapping("/ai/improve/{id}")
    public ResponseEntity<ApiResponse<QuestionImproveDTO>> improveQuestion(
            @PathVariable Long id) {
        
        QuestionImproveDTO improvement = aiQuestionService.improveQuestion(id);
        return ResponseEntity.ok(ApiResponse.success(improvement, "AI đã gợi ý bản cải thiện thành công"));
    }

    // 📌 NEW: AI hỗ trợ sinh đáp án + giải thích
    @Operation(summary = "AI sinh đáp án và giải thích", description = "Sử dụng AI để sinh ra giải thích chi tiết cho câu hỏi")
    @PostMapping("/ai/generate-answer/{id}")
    public ResponseEntity<ApiResponse<AnswerSuggestionDTO>> generateAnswerExplanation(
            @PathVariable Long id) {
        
        AnswerSuggestionDTO answer = aiQuestionService.generateExplanation(id);
        return ResponseEntity.ok(ApiResponse.success(answer, "AI đã sinh đáp án và giải thích thành công"));
    }
}