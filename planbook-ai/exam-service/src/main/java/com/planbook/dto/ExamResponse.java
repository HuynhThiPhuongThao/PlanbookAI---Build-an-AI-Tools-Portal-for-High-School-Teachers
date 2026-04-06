package com.planbook.dto;

import java.time.LocalDateTime;

public class ExamResponse {

    private Long id;
    private String title;
    private Long teacherId;
    private String questionIds;
    private String answerKey;
    private LocalDateTime createdAt;

    public ExamResponse() {
    }

    public ExamResponse(Long id, String title, Long teacherId, String questionIds, String answerKey, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.teacherId = teacherId;
        this.questionIds = questionIds;
        this.answerKey = answerKey;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public String getQuestionIds() {
        return questionIds;
    }

    public String getAnswerKey() {
        return answerKey;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public void setQuestionIds(String questionIds) {
        this.questionIds = questionIds;
    }

    public void setAnswerKey(String answerKey) {
        this.answerKey = answerKey;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}