package com.planbook.dto.admin;

import com.planbook.enums.TemplateStatus;

import java.time.LocalDateTime;

public class CurriculumTemplateResponse {

    private Long id;
    private String name;
    private String description;
    private String gradeLevel;
    private SubjectInfo subject;
    private String structureJson;
    private TemplateStatus status;
    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CurriculumTemplateResponse() {
    }

    public static class SubjectInfo {
        private Long id;
        private String name;

        public SubjectInfo() {
        }

        public SubjectInfo(Long id, String name) {
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

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public SubjectInfo getSubject() {
        return subject;
    }

    public String getStructureJson() {
        return structureJson;
    }

    public TemplateStatus getStatus() {
        return status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
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

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public void setSubject(SubjectInfo subject) {
        this.subject = subject;
    }

    public void setStructureJson(String structureJson) {
        this.structureJson = structureJson;
    }

    public void setStatus(TemplateStatus status) {
        this.status = status;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}