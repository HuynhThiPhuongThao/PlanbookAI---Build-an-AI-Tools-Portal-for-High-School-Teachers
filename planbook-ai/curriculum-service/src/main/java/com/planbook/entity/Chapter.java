package com.planbook.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "chapters")
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Chapter name is required")
    private String name;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Topic> topics = new ArrayList<>();

    public List<Topic> getTopics() {
    return topics;
    }

    public void setTopics(List<Topic> topics) {
    this.topics = topics;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }  
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
}
