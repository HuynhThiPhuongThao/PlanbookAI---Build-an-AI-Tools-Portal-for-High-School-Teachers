package com.planbook.service.staff;

import com.planbook.dto.staff.ChapterResponse;
import com.planbook.dto.staff.SubjectResponse;
import com.planbook.dto.staff.TopicResponse;
import com.planbook.entity.staff.Chapter;
import com.planbook.entity.staff.Subject;
import com.planbook.entity.staff.Topic;
import com.planbook.repository.staff.TopicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicService {
    private final TopicRepository topicRepository;

    public TopicService(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    public List<TopicResponse> getAllTopics() {
        return topicRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TopicResponse getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found with id " + id));
        return toResponse(topic);
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