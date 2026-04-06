package com.planbook.dto;

public class TopicResponse {
    private Long id;
    private String title;
    private ChapterResponse chapter;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ChapterResponse getChapter() { return chapter; }
    public void setChapter(ChapterResponse chapter) { this.chapter = chapter; }
}