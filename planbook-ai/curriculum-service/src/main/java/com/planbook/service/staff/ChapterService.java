package com.planbook.service.staff;

import com.planbook.dto.staff.ChapterResponse;
import com.planbook.dto.staff.SubjectResponse;
import com.planbook.entity.staff.Chapter;
import com.planbook.entity.staff.Subject;
import com.planbook.repository.staff.ChapterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChapterService {
    private final ChapterRepository chapterRepository;

    public ChapterService(ChapterRepository chapterRepository) {
        this.chapterRepository = chapterRepository;
    }

    public List<ChapterResponse> getAllChapters() {
        return chapterRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ChapterResponse> getChaptersBySubject(Long subjectId) {
        return chapterRepository.findBySubjectId(subjectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ChapterResponse getChapterById(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chapter not found with id " + id));
        return toResponse(chapter);
    }

    private ChapterResponse toResponse(Chapter chapter) {
        ChapterResponse res = new ChapterResponse();
        res.setId(chapter.getId());
        res.setName(chapter.getName());

        if (chapter.getSubject() != null) {
            Subject subject = chapter.getSubject();
            SubjectResponse subjectRes = new SubjectResponse();
            subjectRes.setId(subject.getId());
            subjectRes.setName(subject.getName());
            subjectRes.setDescription(subject.getDescription());
            res.setSubject(subjectRes);
        }

        return res;
    }
}