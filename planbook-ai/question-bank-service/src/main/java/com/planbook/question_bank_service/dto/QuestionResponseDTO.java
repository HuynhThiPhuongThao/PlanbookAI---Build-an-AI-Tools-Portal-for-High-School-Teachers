package com.planbook.question_bank_service.dto;

import java.time.LocalDateTime;
import java.util.List;

public class QuestionResponseDTO {
    private Long id;
    private String content;
    private String subject;
    private String topic;
    private String difficultyLevel;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private String status;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor mặc định
    public QuestionResponseDTO() {}
    
    // Constructor có tham số
    public QuestionResponseDTO(Long id, String content, String subject, String topic, String difficultyLevel,
                               List<String> options, String correctAnswer, String explanation, String status,
                               Long authorId, String authorName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.content = content;
        this.subject = subject;
        this.topic = topic;
        this.difficultyLevel = difficultyLevel;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
        this.status = status;
        this.authorId = authorId;
        this.authorName = authorName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getContent() { return content; }
    public String getSubject() { return subject; }
    public String getTopic() { return topic; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public List<String> getOptions() { return options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getExplanation() { return explanation; }
    public String getStatus() { return status; }
    public Long getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setContent(String content) { this.content = content; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public void setOptions(List<String> options) { this.options = options; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public void setStatus(String status) { this.status = status; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}