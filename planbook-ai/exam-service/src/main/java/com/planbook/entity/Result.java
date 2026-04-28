package com.planbook.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "results")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long examId;

    private Long submissionId;

    private String studentName;

    private Double score;

    private Integer totalQuestions;

    private Integer correctCount;

    @Column(columnDefinition = "TEXT")
    private String wrongQuestionIds;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime gradedAt;

    public Result() {
    }

    public Long getId() {
        return id;
    }

    public Long getExamId() {
        return examId;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Double getScore() {
        return score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public String getWrongQuestionIds() {
        return wrongQuestionIds;
    }

    public String getFeedback() {
        return feedback;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public void setWrongQuestionIds(String wrongQuestionIds) {
        this.wrongQuestionIds = wrongQuestionIds;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
}
