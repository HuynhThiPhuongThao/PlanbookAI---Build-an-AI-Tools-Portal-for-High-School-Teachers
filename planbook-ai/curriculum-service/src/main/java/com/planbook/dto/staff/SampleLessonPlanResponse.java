package com.planbook.dto.staff;

import com.planbook.enums.SampleLessonPlanStatus;

import java.time.LocalDateTime;

public class SampleLessonPlanResponse {

    private Long id;
    private String title;
    private String content;
    private CurriculumTemplateInfo curriculumTemplate;
    private TopicInfo topic;
    private Long staffId;
    private SampleLessonPlanStatus status;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SampleLessonPlanResponse() {
    }

    public static class CurriculumTemplateInfo {
        private Long id;
        private String name;

        public CurriculumTemplateInfo() {
        }

        public CurriculumTemplateInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class TopicInfo {
        private Long id;
        private String title;

        public TopicInfo() {
        }

        public TopicInfo(Long id, String title) {
            this.id = id;
            this.title = title;
        }

        public Long getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setTitle(String title) {
            this.title = title;
        }
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

    public CurriculumTemplateInfo getCurriculumTemplate() {
        return curriculumTemplate;
    }

    public TopicInfo getTopic() {
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCurriculumTemplate(CurriculumTemplateInfo curriculumTemplate) {
        this.curriculumTemplate = curriculumTemplate;
    }

    public void setTopic(TopicInfo topic) {
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    //thêm cho manager
    private Long reviewedBy;
    private LocalDateTime reviewedAt;

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