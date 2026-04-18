package com.planbook.question_bank_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions", indexes = {
    @Index(name = "idx_subject_topic", columnList = "subject, topic"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_author_id", columnList = "author_id")
})
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false)
    private String topic;
    
    @Column(nullable = false)
    private String difficultyLevel;
    
    @Column(nullable = false)
    private String correctAnswer;
    
    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text", columnDefinition = "TEXT")
    private List<String> options;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @Column(nullable = false)
    private String status;
    
    @Column(name = "author_id", nullable = false)
    private Long authorId;
    
    @Column(name = "author_name")
    private String authorName;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Question() {}
    
    public Question(Long id, String content, String subject, String topic, String difficultyLevel,
                    String correctAnswer, List<String> options, String explanation, String status,
                    Long authorId, String authorName, Long approvedBy, LocalDateTime approvedAt,
                    String rejectionReason, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.content = content;
        this.subject = subject;
        this.topic = topic;
        this.difficultyLevel = difficultyLevel;
        this.correctAnswer = correctAnswer;
        this.options = options;
        this.explanation = explanation;
        this.status = status;
        this.authorId = authorId;
        this.authorName = authorName;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getContent() { return content; }
    public String getSubject() { return subject; }
    public String getTopic() { return topic; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public String getCorrectAnswer() { return correctAnswer; }
    public List<String> getOptions() { return options; }
    public String getExplanation() { return explanation; }
    public String getStatus() { return status; }
    public Long getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public Long getApprovedBy() { return approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setContent(String content) { this.content = content; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public void setOptions(List<String> options) { this.options = options; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public void setStatus(String status) { this.status = status; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}