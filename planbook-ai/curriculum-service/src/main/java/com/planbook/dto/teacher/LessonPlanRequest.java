package com.planbook.dto.teacher;

import com.planbook.entity.teacher.LessonPlan;

public class LessonPlanRequest {
    private String title;
    private String content;
    private LessonPlan.Status status;
    private Long topicId;
    private Long curriculumTemplateId;
    private Long sampleLessonPlanId; // nullable

    public LessonPlanRequest() {
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public LessonPlan.Status getStatus() {
        return status;
    }

    public Long getTopicId() {
        return topicId;
    }

    public Long getCurriculumTemplateId() {
        return curriculumTemplateId;
    }

    public Long getSampleLessonPlanId() {
        return sampleLessonPlanId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setStatus(LessonPlan.Status status) {
        this.status = status;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }

    public void setCurriculumTemplateId(Long curriculumTemplateId) {
        this.curriculumTemplateId = curriculumTemplateId;
    }

    public void setSampleLessonPlanId(Long sampleLessonPlanId) {
        this.sampleLessonPlanId = sampleLessonPlanId;
    }
}