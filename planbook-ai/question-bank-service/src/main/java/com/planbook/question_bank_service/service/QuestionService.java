package com.planbook.question_bank_service.service;

import com.planbook.question_bank_service.dto.PaginatedResponse;
import com.planbook.question_bank_service.dto.QuestionRequestDTO;
import com.planbook.question_bank_service.dto.QuestionResponseDTO;
import com.planbook.question_bank_service.entity.Question;
import com.planbook.question_bank_service.enums.QuestionStatus;
import com.planbook.question_bank_service.exception.ResourceNotFoundException;
import com.planbook.question_bank_service.exception.UnauthorizedException;
import com.planbook.question_bank_service.repository.QuestionRepository;
import com.planbook.question_bank_service.specification.QuestionSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    private final UserContextService userContextService;
    
    public QuestionService(QuestionRepository questionRepository, UserContextService userContextService) {
        this.questionRepository = questionRepository;
        this.userContextService = userContextService;
    }
    
    @Transactional(readOnly = true)
    public PaginatedResponse<QuestionResponseDTO> getAllQuestions(
            String subject, String topic, String difficultyLevel, 
            String keyword, int pageNo, int pageSize, String sortBy) {
        
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortBy).descending());
        
        Specification<Question> spec = Specification
                .where(QuestionSpecification.hasSubject(subject))
                .and(QuestionSpecification.hasTopic(topic))
                .and(QuestionSpecification.hasDifficulty(difficultyLevel))
                // Tạm thời bỏ filter status để xem tất cả câu hỏi
                //.and(QuestionSpecification.hasStatus(QuestionStatus.APPROVED.name()))
                .and(QuestionSpecification.contentContains(keyword));
        
        Page<Question> questionPage = questionRepository.findAll(spec, pageable);
        
        return buildPaginatedResponse(questionPage);
    }
    
    @Transactional(readOnly = true)
    public PaginatedResponse<QuestionResponseDTO> getPendingQuestionsForManager(int pageNo, int pageSize) {
        userContextService.requireRole("MANAGER");
        
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").ascending());
        Page<Question> questionPage = questionRepository.findByStatus(QuestionStatus.PENDING.name(), pageable);
        
        return buildPaginatedResponse(questionPage);
    }
    
    @Transactional(readOnly = true)
    public QuestionResponseDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi với ID: " + id));
        
        if (!question.getStatus().equals(QuestionStatus.APPROVED.name()) &&
            !userContextService.isCurrentUserAuthor(question.getAuthorId()) &&
            !userContextService.hasRole("MANAGER") &&
            !userContextService.hasRole("ADMIN")) {
            throw new UnauthorizedException("Bạn không có quyền xem câu hỏi này");
        }
        
        return convertToDTO(question);
    }
    
    @Transactional
    public QuestionResponseDTO createQuestion(QuestionRequestDTO request) {
        Long currentUserId = userContextService.getCurrentUserId();
        String currentUserName = userContextService.getCurrentUserName();
        
        userContextService.requireRole("TEACHER", "STAFF");
    
    Question question = new Question();
    question.setContent(request.getContent());
    question.setSubject(request.getSubject());
    question.setTopic(request.getTopic());
    question.setDifficultyLevel(request.getDifficultyLevel());
    question.setCorrectAnswer(request.getCorrectAnswer());
    question.setOptions(request.getOptions());
    question.setExplanation(request.getExplanation());
    question.setStatus(QuestionStatus.PENDING.name());
    question.setAuthorId(currentUserId);
    question.setAuthorName(currentUserName);
    
    Question savedQuestion = questionRepository.save(question);
    System.out.println("Câu hỏi mới được tạo bởi user ID: " + currentUserId + " với ID: " + savedQuestion.getId());
    
    return convertToDTO(savedQuestion);
}
    
    @Transactional
    public QuestionResponseDTO updateQuestion(Long id, QuestionRequestDTO request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi với ID: " + id));
        
        if (!userContextService.isCurrentUserAuthor(question.getAuthorId())) {
            throw new UnauthorizedException("Bạn không có quyền sửa câu hỏi này");
        }
        
        if (!question.getStatus().equals(QuestionStatus.PENDING.name())) {
            throw new UnauthorizedException("Chỉ có thể sửa câu hỏi khi đang ở trạng thái PENDING");
        }
        
        question.setContent(request.getContent());
        question.setSubject(request.getSubject());
        question.setTopic(request.getTopic());
        question.setDifficultyLevel(request.getDifficultyLevel());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setOptions(request.getOptions());
        question.setExplanation(request.getExplanation());
        
        Question updatedQuestion = questionRepository.save(question);
        System.out.println("Câu hỏi ID: " + id + " được cập nhật bởi user ID: " + userContextService.getCurrentUserId());
        
        return convertToDTO(updatedQuestion);
    }
    
    @Transactional
    public void deleteQuestion(Long id) {
        userContextService.requireRole("ADMIN");
    
    Question question = questionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi với ID: " + id));
    
    // Xóa các options trước (do khóa ngoại)
    if (question.getOptions() != null) {
        question.getOptions().clear();
    }
    
    questionRepository.delete(question);
    System.out.println("Câu hỏi ID: " + id + " đã bị xóa");
}
    
    @Transactional
    public QuestionResponseDTO approveQuestion(Long id, boolean approved, String rejectionReason) {
        userContextService.requireRole("MANAGER");
        
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy câu hỏi với ID: " + id));
        
        if (!question.getStatus().equals(QuestionStatus.PENDING.name())) {
            throw new UnauthorizedException("Câu hỏi này đã được xử lý trước đó");
        }
        
        if (approved) {
            question.setStatus(QuestionStatus.APPROVED.name());
            question.setRejectionReason(null);
            System.out.println("Câu hỏi ID: " + id + " được duyệt bởi Manager: " + userContextService.getCurrentUserId());
        } else {
            question.setStatus(QuestionStatus.REJECTED.name());
            question.setRejectionReason(rejectionReason);
            System.out.println("Câu hỏi ID: " + id + " bị từ chối bởi Manager: " + userContextService.getCurrentUserId() + ". Lý do: " + rejectionReason);
        }
        
        question.setApprovedBy(userContextService.getCurrentUserId());
        question.setApprovedAt(LocalDateTime.now());
        
        Question approvedQuestion = questionRepository.save(question);
        return convertToDTO(approvedQuestion);
    }
    
    private PaginatedResponse<QuestionResponseDTO> buildPaginatedResponse(Page<Question> page) {
        PaginatedResponse<QuestionResponseDTO> response = new PaginatedResponse<>();
        response.setContent(page.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
        response.setPageNo(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
    
    private QuestionResponseDTO convertToDTO(Question question) {
        QuestionResponseDTO dto = new QuestionResponseDTO();
        dto.setId(question.getId());
        dto.setContent(question.getContent());
        dto.setSubject(question.getSubject());
        dto.setTopic(question.getTopic());
        dto.setDifficultyLevel(question.getDifficultyLevel());
        dto.setOptions(question.getOptions());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        dto.setExplanation(question.getExplanation());
        dto.setStatus(question.getStatus());
        dto.setAuthorId(question.getAuthorId());
        dto.setAuthorName(question.getAuthorName());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());
        return dto;
    }
}
