package com.planbook.entity;

import jakarta.persistence.*;
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