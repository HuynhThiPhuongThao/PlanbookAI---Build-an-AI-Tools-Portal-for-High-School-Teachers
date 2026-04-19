package com.planbook.entity.staff;

import com.planbook.enums.SampleLessonPlanStatus;
import com.planbook.entity.admin.CurriculumTemplate;
import com.planbook.entity.staff.Topic;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sample_lesson_plans")
public class SampleLessonPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_template_id", nullable = false)
    private CurriculumTemplate curriculumTemplate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SampleLessonPlanStatus status = SampleLessonPlanStatus.DRAFT;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    //thêm vào cho manager
    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public SampleLessonPlan() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public CurriculumTemplate getCurriculumTemplate() {
        return curriculumTemplate;
    }

    public Topic getTopic() {
        return topic;
    }

    public Long getStaffId() {
        return staffId;
    }

    public SampleLessonPlanStatus getStatus() {
        return status;
    }

    public String getReviewNote() {
        return reviewNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCurriculumTemplate(CurriculumTemplate curriculumTemplate) {
        this.curriculumTemplate = curriculumTemplate;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public void setStatus(SampleLessonPlanStatus status) {
        this.status = status;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
    }

    // thêm cho manager
    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}