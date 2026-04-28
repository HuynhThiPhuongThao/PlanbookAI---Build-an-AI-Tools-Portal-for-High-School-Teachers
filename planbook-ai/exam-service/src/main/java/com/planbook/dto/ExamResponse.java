package com.planbook.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ExamResponse {

    private Long id;
    private String title;
    private Long teacherId;
    private String questionIds;
    private String answerKey;
    private Integer questionCount;
    private List<QuestionDTO> questions;
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

    public Integer getQuestionCount() {
        return questionCount;
    }

    public List<QuestionDTO> getQuestions() {
        return questions;
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

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public void setQuestions(List<QuestionDTO> questions) {
        this.questions = questions;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
