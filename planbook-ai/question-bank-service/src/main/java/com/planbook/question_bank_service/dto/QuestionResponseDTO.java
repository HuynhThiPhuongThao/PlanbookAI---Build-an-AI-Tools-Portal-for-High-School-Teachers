package com.planbook.question_bank_service.dto;

import java.time.LocalDateTime;
import java.util.List;

public class QuestionResponseDTO {
    private Long id;
    private String content;
    private String subject;
    private String topic;
    private Long subjectId;
    private Long chapterId;
    private Long topicId;
    private String difficultyLevel;
    private List<String> options;
    private String correctAnswer;
    private String explanation;
    private String status;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public QuestionResponseDTO() {}

    public Long getId() { return id; }
    public String getContent() { return content; }
    public String getSubject() { return subject; }
    public String getTopic() { return topic; }
    public Long getSubjectId() { return subjectId; }
    public Long getChapterId() { return chapterId; }
    public Long getTopicId() { return topicId; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public List<String> getOptions() { return options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getExplanation() { return explanation; }
    public String getStatus() { return status; }
    public Long getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setContent(String content) { this.content = content; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public void setChapterId(Long chapterId) { this.chapterId = chapterId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }
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
