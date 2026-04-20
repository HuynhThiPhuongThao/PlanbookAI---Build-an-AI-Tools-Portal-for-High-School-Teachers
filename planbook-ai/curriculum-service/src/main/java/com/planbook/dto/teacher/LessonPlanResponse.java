package com.planbook.dto.teacher;

import com.planbook.dto.staff.TopicResponse;
import java.time.LocalDateTime;

public class LessonPlanResponse {
    private Long id;
    private String title;
    private String content;
    private String status;
    private Long teacherId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private TopicResponse topic;
    private CurriculumTemplateInfo curriculumTemplate;
    private SampleLessonPlanInfo sampleLessonPlan;

    public static class CurriculumTemplateInfo {
        private Long id;
        private String name;
    
        public CurriculumTemplateInfo() {
        }
    
        public CurriculumTemplateInfo(Long id, String name) {
            this.id = id;
            this.name = name;
        }
    
        public Long getId() {return id;}
        public void setId(Long id) {
                this.id = id;
        }
    
        public String getName() {return name; }
        public void setName(String name) {
                this.name = name;
        }
    }

    public static class SampleLessonPlanInfo {
        private Long id;
        private String title;
    
        public SampleLessonPlanInfo() {
        }
    
        public SampleLessonPlanInfo(Long id, String title) {
            this.id = id;
            this.title = title;
        }
    
        public Long getId() {return id;}
        public void setId(Long id) {
                this.id = id;
        }
    
        public String getTitle() {return title; }
        public void setTitle(String title) {
                this.title = title;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public TopicResponse getTopic() {
        return topic;
    }

    public void setTopic(TopicResponse topic) {
        this.topic = topic;
    }

    public CurriculumTemplateInfo getCurriculumTemplate() {
        return curriculumTemplate;
    }

    public void setCurriculumTemplate(CurriculumTemplateInfo curriculumTemplate) {
        this.curriculumTemplate = curriculumTemplate;
    }

    public SampleLessonPlanInfo getSampleLessonPlan() {
        return sampleLessonPlan;
    }

    public void setSampleLessonPlan(SampleLessonPlanInfo sampleLessonPlan) {
        this.sampleLessonPlan = sampleLessonPlan;
    }

}