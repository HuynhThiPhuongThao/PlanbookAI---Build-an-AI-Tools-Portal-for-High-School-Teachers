package com.planbook.dto.admin;

import com.planbook.enums.TemplateStatus;

public class CurriculumTemplateRequest {

    private String name;
    private String description;
    private String gradeLevel;
    private Long subjectId;
    private String structureJson;
    private TemplateStatus status;

    public CurriculumTemplateRequest() {
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

    public Long getSubjectId() {
        return subjectId;
    }

    public String getStructureJson() {
        return structureJson;
    }

    public TemplateStatus getStatus() {
        return status;
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

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public void setStructureJson(String structureJson) {
        this.structureJson = structureJson;
    }

    public void setStatus(TemplateStatus status) {
        this.status = status;
    }
}

