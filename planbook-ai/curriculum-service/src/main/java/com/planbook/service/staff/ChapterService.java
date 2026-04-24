package com.planbook.service.staff;

import com.planbook.dto.staff.ChapterResponse;
import com.planbook.dto.staff.SubjectResponse;
import com.planbook.dto.staff.ChapterRequest;
import com.planbook.entity.staff.Chapter;
import com.planbook.entity.staff.Subject;
import com.planbook.repository.staff.ChapterRepository;
import com.planbook.repository.staff.SubjectRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;

@Service
public class ChapterService {
    private final ChapterRepository chapterRepository;
    private final SubjectRepository subjectRepository;

    public ChapterService(ChapterRepository chapterRepository, SubjectRepository subjectRepository) {
        this.chapterRepository = chapterRepository;
        this.subjectRepository = subjectRepository;
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
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id " + id));
        return toResponse(chapter);
    }

    public ChapterResponse createChapter(ChapterRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id " + request.getSubjectId()));
        Chapter chapter = new Chapter();
        chapter.setName(request.getName());
        chapter.setSubject(subject);
        chapter = chapterRepository.save(chapter);
        return toResponse(chapter);
    }

    public ChapterResponse updateChapter(Long id, ChapterRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Chapter not found with id " + id));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id " + request.getSubjectId()));
        chapter.setName(request.getName());
        chapter.setSubject(subject);
        chapter = chapterRepository.save(chapter);
        return toResponse(chapter);
    }

    public void deleteChapter(Long id) {
        if (!chapterRepository.existsById(id)) {
            throw new EntityNotFoundException("Chapter not found with id " + id);
        }
        chapterRepository.deleteById(id);
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