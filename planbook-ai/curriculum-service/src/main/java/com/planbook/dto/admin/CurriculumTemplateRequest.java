package com.planbook.dto.admin;

import com.planbook.enums.TemplateStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CurriculumTemplateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Size(min = 5, max = 500, message = "Description must be between 5-500 chars")
    private String description;

    @NotNull(message = "Grade level is required")
    private String gradeLevel;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Structure JSON is required")
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

