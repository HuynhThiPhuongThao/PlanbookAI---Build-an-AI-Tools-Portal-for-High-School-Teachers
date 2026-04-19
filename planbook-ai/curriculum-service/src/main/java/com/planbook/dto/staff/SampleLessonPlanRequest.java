package com.planbook.dto.staff;

public class SampleLessonPlanRequest {

    private String title;
    private String content;
    private Long curriculumTemplateId;
    private Long topicId;

    public SampleLessonPlanRequest() {
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public Long getCurriculumTemplateId() {
        return curriculumTemplateId;
    }

    public Long getTopicId() {
        return topicId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCurriculumTemplateId(Long curriculumTemplateId) {
        this.curriculumTemplateId = curriculumTemplateId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }
}