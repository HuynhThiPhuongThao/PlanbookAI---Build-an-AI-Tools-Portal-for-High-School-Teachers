package com.planbook.dto;

public class ChapterResponse {
    private Long id;
    private String name;
    private SubjectResponse subject;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public SubjectResponse getSubject() { return subject; }
    public void setSubject(SubjectResponse subject) { this.subject = subject; }
}