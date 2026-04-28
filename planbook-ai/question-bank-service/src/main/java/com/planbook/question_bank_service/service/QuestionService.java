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
import java.util.Locale;
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
            String subject,
            String topic,
            Long subjectId,
            Long chapterId,
            Long topicId,
            String difficultyLevel,
            String status,
            String keyword,
            int pageNo,
            int pageSize,
            String sortBy
    ) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(sortBy).descending());

        Specification<Question> spec = Specification
                .where(QuestionSpecification.hasSubject(subject))
                .and(QuestionSpecification.hasTopic(topic))
                .and(QuestionSpecification.hasSubjectId(subjectId))
                .and(QuestionSpecification.hasChapterId(chapterId))
                .and(QuestionSpecification.hasTopicId(topicId))
                .and(QuestionSpecification.hasDifficulty(difficultyLevel))
                .and(QuestionSpecification.hasStatus(status))
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
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));

        boolean canView =
                QuestionStatus.APPROVED.name().equals(question.getStatus())
                        || userContextService.isCurrentUserAuthor(question.getAuthorId())
                        || userContextService.hasRole("MANAGER")
                        || userContextService.hasRole("ADMIN");

        if (!canView) {
            throw new UnauthorizedException("You do not have permission to view this question");
        }

        return convertToDTO(question);
    }

    @Transactional
    public QuestionResponseDTO createQuestion(QuestionRequestDTO request) {
        userContextService.requireRole("STAFF");

        Long currentUserId = userContextService.getCurrentUserId();
        String currentUserName = userContextService.getCurrentUserName();

        Question question = new Question();
        applyQuestionRequest(question, request);
        question.setStatus(QuestionStatus.APPROVED.name());
        question.setAuthorId(currentUserId);
        question.setAuthorName(currentUserName);
        question.setApprovedBy(currentUserId);
        question.setApprovedAt(LocalDateTime.now());

        Question savedQuestion = questionRepository.save(question);
        return convertToDTO(savedQuestion);
    }

    @Transactional
    public QuestionResponseDTO updateQuestion(Long id, QuestionRequestDTO request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));

        if (!userContextService.isCurrentUserAuthor(question.getAuthorId())) {
            throw new UnauthorizedException("You do not have permission to edit this question");
        }

        if (!QuestionStatus.PENDING.name().equals(question.getStatus())) {
            throw new UnauthorizedException("Question can only be edited while it is PENDING");
        }

        applyQuestionRequest(question, request);
        Question updatedQuestion = questionRepository.save(question);

        return convertToDTO(updatedQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        userContextService.requireRole("ADMIN");

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));

        if (question.getOptions() != null) {
            question.getOptions().clear();
        }

        questionRepository.delete(question);
    }

    @Transactional
    public QuestionResponseDTO approveQuestion(Long id, boolean approved, String rejectionReason) {
        userContextService.requireRole("MANAGER");

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));

        if (!QuestionStatus.PENDING.name().equals(question.getStatus())) {
            throw new UnauthorizedException("This question has already been processed");
        }

        if (approved) {
            question.setStatus(QuestionStatus.APPROVED.name());
            question.setRejectionReason(null);
        } else {
            question.setStatus(QuestionStatus.REJECTED.name());
            question.setRejectionReason(rejectionReason);
        }

        question.setApprovedBy(userContextService.getCurrentUserId());
        question.setApprovedAt(LocalDateTime.now());

        Question approvedQuestion = questionRepository.save(question);
        return convertToDTO(approvedQuestion);
    }

    private void applyQuestionRequest(Question question, QuestionRequestDTO request) {
        question.setContent(request.getContent());
        question.setSubject(request.getSubject());
        question.setTopic(request.getTopic());
        question.setSubjectId(request.getSubjectId());
        question.setChapterId(request.getChapterId());
        question.setTopicId(request.getTopicId());
        question.setDifficultyLevel(normalizeDifficulty(request.getDifficultyLevel()));
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setOptions(request.getOptions());
        question.setExplanation(request.getExplanation());
    }

    private String normalizeDifficulty(String difficultyLevel) {
        return difficultyLevel == null ? null : difficultyLevel.trim().toUpperCase(Locale.ROOT);
    }

    private PaginatedResponse<QuestionResponseDTO> buildPaginatedResponse(Page<Question> page) {
        PaginatedResponse<QuestionResponseDTO> response = new PaginatedResponse<>();
        response.setContent(page.getContent().stream().map(this::convertToDTO).collect(Collectors.toList()));
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
        dto.setSubjectId(question.getSubjectId());
        dto.setChapterId(question.getChapterId());
        dto.setTopicId(question.getTopicId());
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
