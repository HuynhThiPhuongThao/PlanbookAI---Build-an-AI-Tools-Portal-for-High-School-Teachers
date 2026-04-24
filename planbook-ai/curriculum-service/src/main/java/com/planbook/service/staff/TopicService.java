package com.planbook.service.staff;

import com.planbook.dto.staff.ChapterResponse;
import com.planbook.dto.staff.SubjectResponse;
import com.planbook.dto.staff.TopicResponse;
import com.planbook.dto.staff.TopicRequest;
import com.planbook.entity.staff.Chapter;
import com.planbook.entity.staff.Subject;
import com.planbook.entity.staff.Topic;
import com.planbook.repository.staff.ChapterRepository;
import com.planbook.repository.staff.TopicRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;

@Service
public class TopicService {
    private final TopicRepository topicRepository;
    private final ChapterRepository chapterRepository;

    public TopicService(TopicRepository topicRepository, ChapterRepository chapterRepository) {
        this.topicRepository = topicRepository;
        this.chapterRepository = chapterRepository;
    }

    public List<TopicResponse> getAllTopics() {
        return topicRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TopicResponse getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id " + id));
        return toResponse(topic);
    }

    public TopicResponse createTopic(TopicRequest request) {
        Chapter chapter = chapterRepository.findById(request.getChapterId())
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id " + request.getChapterId()));
        Topic topic = new Topic();
        topic.setTitle(request.getTitle());
        topic.setChapter(chapter);
        topic = topicRepository.save(topic);
        return toResponse(topic);
    }

    public TopicResponse updateTopic(Long id, TopicRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id " + id));
        Chapter chapter = chapterRepository.findById(request.getChapterId())
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id " + request.getChapterId()));
        topic.setTitle(request.getTitle());
        topic.setChapter(chapter);
        topic = topicRepository.save(topic);
        return toResponse(topic);
    }

    public void deleteTopic(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new EntityNotFoundException("Topic not found with id " + id);
        }
        topicRepository.deleteById(id);
    }

    public List<TopicResponse> getTopicsByChapter(Long chapterId) {
        return topicRepository.findByChapterId(chapterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TopicResponse toResponse(Topic topic) {
        TopicResponse res = new TopicResponse();
        res.setId(topic.getId());
        res.setTitle(topic.getTitle());

        if (topic.getChapter() != null) {
            Chapter chapter = topic.getChapter();
            ChapterResponse chapterRes = new ChapterResponse();
            chapterRes.setId(chapter.getId());
            chapterRes.setName(topic.getChapter().getName());

            if (topic.getChapter().getSubject() != null) {
                Subject subject = chapter.getSubject();
                SubjectResponse subjectRes = new SubjectResponse();
                subjectRes.setId(topic.getChapter().getSubject().getId());
                subjectRes.setName(topic.getChapter().getSubject().getName());
                subjectRes.setDescription(topic.getChapter().getSubject().getDescription());
                chapterRes.setSubject(subjectRes);
            }

            res.setChapter(chapterRes);
        }

        return res;
    }
}