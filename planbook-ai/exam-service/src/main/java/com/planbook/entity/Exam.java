package com.planbook.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Long teacherId;

    @Column(columnDefinition = "TEXT")
    private String questionIds; // ví dụ: 1,2,3,4

    @Column(columnDefinition = "TEXT")
    private String answerKey;   // ví dụ: 1:A,2:B,3:C

    @Column(columnDefinition = "LONGTEXT")
    private String questionsJson;

    private LocalDateTime createdAt;

    public Exam() {
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

    public String getQuestionsJson() {
        return questionsJson;
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

    public void setQuestionsJson(String questionsJson) {
        this.questionsJson = questionsJson;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
