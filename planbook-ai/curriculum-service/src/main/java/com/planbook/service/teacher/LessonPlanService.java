package com.planbook.service.teacher;

import com.planbook.dto.teacher.LessonPlanRequest;
import com.planbook.dto.teacher.LessonPlanResponse;
import com.planbook.dto.staff.TopicResponse;
import com.planbook.dto.PromptDTO;
import com.planbook.dto.staff.ChapterResponse;
import com.planbook.dto.staff.SubjectResponse;
import com.planbook.entity.teacher.LessonPlan;
import com.planbook.entity.staff.Topic;
import com.planbook.entity.admin.CurriculumTemplate;
import com.planbook.entity.staff.SampleLessonPlan;
import com.planbook.enums.SampleLessonPlanStatus;
import com.planbook.repository.teacher.LessonPlanRepository;
import com.planbook.repository.staff.TopicRepository;
import com.planbook.repository.admin.CurriculumTemplateRepository;
import com.planbook.repository.staff.SampleLessonPlanRepository;
import com.planbook.service.AiPromptService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonPlanService {
    private final LessonPlanRepository lessonPlanRepository;
    private final TopicRepository topicRepository;
    private final CurriculumTemplateRepository curriculumTemplateRepository;
    private final SampleLessonPlanRepository sampleLessonPlanRepository;
    private final AiPromptService aiPromptService;

    public LessonPlanService(LessonPlanRepository lessonPlanRepository,
                             TopicRepository topicRepository,
                             CurriculumTemplateRepository curriculumTemplateRepository,
                             SampleLessonPlanRepository sampleLessonPlanRepository,
                             AiPromptService aiPromptService) {
        this.lessonPlanRepository = lessonPlanRepository;
        this.topicRepository = topicRepository;
        this.curriculumTemplateRepository = curriculumTemplateRepository;
        this.sampleLessonPlanRepository = sampleLessonPlanRepository;
        this.aiPromptService = aiPromptService;
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

    public LessonPlanResponse addLessonPlan(LessonPlanRequest request, Long teacherId) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id " + request.getTopicId()));

        CurriculumTemplate curriculumTemplate = curriculumTemplateRepository.findById(request.getCurriculumTemplateId())
                .orElseThrow(() -> new EntityNotFoundException("Curriculum template not found with id " + request.getCurriculumTemplateId()));

        SampleLessonPlan sampleLessonPlan = null;
        if (request.getSampleLessonPlanId() != null) {
                sampleLessonPlan = sampleLessonPlanRepository.findById(request.getSampleLessonPlanId())
                    .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id " + request.getSampleLessonPlanId()));

            if (sampleLessonPlan.getStatus() != SampleLessonPlanStatus.APPROVED) {
                throw new IllegalStateException("Only approved sample lesson plans can be used");
            }
        }

        LessonPlan lessonPlan = new LessonPlan();

        //Bổ sung logic gọi AI service nếu content rỗng
        if (request.getContent() == null || request.getContent().isBlank()) {
            PromptDTO.PromptResponse prompt = aiPromptService.getActivePrompt("lessonplan_template");
            lessonPlan.setContent(prompt.getContent());
            lessonPlan.setTitle(prompt.getName());
        } else {
            lessonPlan.setTitle(request.getTitle());
            lessonPlan.setContent(request.getContent());
        }

        lessonPlan.setStatus(request.getStatus() != null ? request.getStatus() : LessonPlan.Status.DRAFT);
        lessonPlan.setTeacherId(teacherId);
        lessonPlan.setTopic(topic);
        lessonPlan.setCurriculumTemplate(curriculumTemplate);
        lessonPlan.setSampleLessonPlan(sampleLessonPlan);

        LessonPlan saved = lessonPlanRepository.save(lessonPlan);
        return toResponse(saved);
    }

    public LessonPlanResponse updateLessonPlan(Long id, LessonPlanRequest request, Long teacherId) {
        LessonPlan existing = lessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("LessonPlan not found with id " + id));

        if (!existing.getTeacherId().equals(teacherId)) {
            throw new AccessDeniedException("You can only update your own lesson plans");
        }

        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id " + request.getTopicId()));

        CurriculumTemplate curriculumTemplate = curriculumTemplateRepository.findById(request.getCurriculumTemplateId())
                .orElseThrow(() -> new EntityNotFoundException("Curriculum template not found with id " + request.getCurriculumTemplateId()));

        SampleLessonPlan sampleLessonPlan = null;
        if (request.getSampleLessonPlanId() != null) {
            sampleLessonPlan = sampleLessonPlanRepository.findById(request.getSampleLessonPlanId())
                    .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id " + request.getSampleLessonPlanId()));

            if (sampleLessonPlan.getStatus() != SampleLessonPlanStatus.APPROVED) {
                throw new IllegalStateException("Only approved sample lesson plans can be used");
            }
        }


         // ✅ Bổ sung logic gọi AI service nếu content rỗng khi update
        if (request.getContent() == null || request.getContent().isBlank()) {
            PromptDTO.PromptResponse prompt = aiPromptService.getActivePrompt("lessonplan_template");
            existing.setContent(prompt.getContent());
            existing.setTitle(prompt.getName());
        } else {
        existing.setTitle(request.getTitle());
        existing.setContent(request.getContent());
        }
        existing.setStatus(request.getStatus() != null ? request.getStatus() : existing.getStatus());
        existing.setTopic(topic);
        existing.setCurriculumTemplate(curriculumTemplate);
        existing.setSampleLessonPlan(sampleLessonPlan);

        LessonPlan updated = lessonPlanRepository.save(existing);
        return toResponse(updated);
    }

    public void deleteLessonPlan(Long id, Long teacherId) {
        LessonPlan existing = lessonPlanRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("LessonPlan not found with id " + id));

        if (!existing.getTeacherId().equals(teacherId)) {
        throw new AccessDeniedException("You can only delete your own lesson plans");
    }

    lessonPlanRepository.delete(existing);
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

        if (lessonPlan.getCurriculumTemplate() != null) {
            response.setCurriculumTemplate(
                    new LessonPlanResponse.CurriculumTemplateInfo(
                            lessonPlan.getCurriculumTemplate().getId(),
                            lessonPlan.getCurriculumTemplate().getName()
                    )
            );
        }

        if (lessonPlan.getSampleLessonPlan() != null) {
            response.setSampleLessonPlan(
                    new LessonPlanResponse.SampleLessonPlanInfo(
                            lessonPlan.getSampleLessonPlan().getId(),
                            lessonPlan.getSampleLessonPlan().getTitle()
                    )
            );
        }

        return response;
    }
}



