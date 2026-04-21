package com.planbook.dto.staff;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SampleLessonPlanRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    private Long curriculumTemplateId;

    @NotNull(message = "Bài học (Topic ID) không được để trống")
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