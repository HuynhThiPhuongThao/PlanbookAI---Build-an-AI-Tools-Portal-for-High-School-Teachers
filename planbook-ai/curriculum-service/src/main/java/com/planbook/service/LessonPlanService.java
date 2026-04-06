package com.planbook.service;

import com.planbook.dto.LessonPlanResponse;
import com.planbook.dto.TopicResponse;
import com.planbook.dto.ChapterResponse;
import com.planbook.dto.SubjectResponse;

import com.planbook.entity.LessonPlan;
import com.planbook.repository.LessonPlanRepository;
import com.planbook.entity.Topic;
import com.planbook.repository.TopicRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;


@Service
public class LessonPlanService {
    private final LessonPlanRepository lessonPlanRepository;
    private final TopicRepository topicRepository;

    public LessonPlanService(LessonPlanRepository lessonPlanRepository, TopicRepository topicRepository) {
        this.lessonPlanRepository = lessonPlanRepository;
        this.topicRepository = topicRepository;
    }

    public List<LessonPlanResponse> getLessonPlansByTeacher(Long teacherId) {
        return lessonPlanRepository.findByTeacherId(teacherId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<LessonPlanResponse> getLessonPlansByTopic(Long topicId) {
        return lessonPlanRepository.findByTopicId(topicId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public LessonPlanResponse addLessonPlan(LessonPlan lessonPlan, Long teacherId) {
        Long topicId = lessonPlan.getTopic().getId();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id " + topicId));

        lessonPlan.setTopic(topic);
        lessonPlan.setTeacherId(teacherId);
        
        LessonPlan saved = lessonPlanRepository.save(lessonPlan);
        return toResponse(saved);
    }

    public LessonPlanResponse updateLessonPlan(Long id, LessonPlan details, Long teacherId) {
    LessonPlan existing = lessonPlanRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("LessonPlan not found with id " + id));

    if (!existing.getTeacherId().equals(teacherId)) {
        throw new AccessDeniedException("You can only update your own lesson plans");
    }

    existing.setTitle(details.getTitle());
    existing.setContent(details.getContent());
    existing.setStatus(details.getStatus());

    if (details.getTopic() != null && details.getTopic().getId() != null) {
        Long topicId = details.getTopic().getId();
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id " + topicId));
        existing.setTopic(topic);
    }

    LessonPlan updated = lessonPlanRepository.save(existing);
    return toResponse(updated);
}

    private LessonPlanResponse toResponse(LessonPlan lessonPlan) {
    LessonPlanResponse response = new LessonPlanResponse();
    response.setId(lessonPlan.getId());
    response.setTitle(lessonPlan.getTitle());
    response.setContent(lessonPlan.getContent());
    response.setStatus(lessonPlan.getStatus().name());
    response.setTeacherId(lessonPlan.getTeacherId());
    response.setCreatedAt(lessonPlan.getCreatedAt());
    response.setUpdatedAt(lessonPlan.getUpdatedAt());

    if (lessonPlan.getTopic() != null) {
        TopicResponse topicRes = new TopicResponse();
        topicRes.setId(lessonPlan.getTopic().getId());
        topicRes.setTitle(lessonPlan.getTopic().getTitle());

        if (lessonPlan.getTopic().getChapter() != null) {
            ChapterResponse chapterRes = new ChapterResponse();
            chapterRes.setId(lessonPlan.getTopic().getChapter().getId());
            chapterRes.setName(lessonPlan.getTopic().getChapter().getName());

            if (lessonPlan.getTopic().getChapter().getSubject() != null) {
                SubjectResponse subjectRes = new SubjectResponse();
                subjectRes.setId(lessonPlan.getTopic().getChapter().getSubject().getId());
                subjectRes.setName(lessonPlan.getTopic().getChapter().getSubject().getName());
                subjectRes.setDescription(lessonPlan.getTopic().getChapter().getSubject().getDescription());
                chapterRes.setSubject(subjectRes);
            }

            topicRes.setChapter(chapterRes);
        }

        response.setTopic(topicRes);
    }

    return response;
}
}
