package com.planbook.service.teacher;

import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.entity.staff.SampleLessonPlan;
import com.planbook.enums.SampleLessonPlanStatus;
import com.planbook.repository.staff.SampleLessonPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SampleLessonPlanTeacherService {

    private final SampleLessonPlanRepository sampleLessonPlanRepository;

    public SampleLessonPlanTeacherService(SampleLessonPlanRepository sampleLessonPlanRepository) {
        this.sampleLessonPlanRepository = sampleLessonPlanRepository;
    }

    public List<SampleLessonPlanResponse> getApprovedSamples(Long topicId, Long curriculumTemplateId) {
        List<SampleLessonPlan> sampleLessonPlans;

        if (topicId != null && curriculumTemplateId != null) {
            sampleLessonPlans = sampleLessonPlanRepository
                    .findByTopicIdAndCurriculumTemplateIdAndStatus(
                            topicId,
                            curriculumTemplateId,
                            SampleLessonPlanStatus.APPROVED
                    );
        } else if (topicId != null) {
            sampleLessonPlans = sampleLessonPlanRepository
                    .findByTopicIdAndStatus(topicId, SampleLessonPlanStatus.APPROVED);
        } else if (curriculumTemplateId != null) {
            sampleLessonPlans = sampleLessonPlanRepository
                    .findByCurriculumTemplateIdAndStatus(curriculumTemplateId, SampleLessonPlanStatus.APPROVED);
        } else {
            sampleLessonPlans = sampleLessonPlanRepository
                    .findByStatus(SampleLessonPlanStatus.APPROVED);
        }

        return sampleLessonPlans.stream()
                .map(this::toResponse)
                .toList();
    }

    private SampleLessonPlanResponse toResponse(SampleLessonPlan sampleLessonPlan) {
        SampleLessonPlanResponse response = new SampleLessonPlanResponse();
        response.setId(sampleLessonPlan.getId());
        response.setTitle(sampleLessonPlan.getTitle());
        response.setContent(sampleLessonPlan.getContent());
        response.setStaffId(sampleLessonPlan.getStaffId());
        response.setStatus(sampleLessonPlan.getStatus());
        response.setReviewNote(sampleLessonPlan.getReviewNote());
        response.setCreatedAt(sampleLessonPlan.getCreatedAt());
        response.setUpdatedAt(sampleLessonPlan.getUpdatedAt());
        response.setReviewedBy(sampleLessonPlan.getReviewedBy());
        response.setReviewedAt(sampleLessonPlan.getReviewedAt());

        if (sampleLessonPlan.getCurriculumTemplate() != null) {
            response.setCurriculumTemplate(
                    new SampleLessonPlanResponse.CurriculumTemplateInfo(
                            sampleLessonPlan.getCurriculumTemplate().getId(),
                            sampleLessonPlan.getCurriculumTemplate().getName()
                    )
            );
        }
if (sampleLessonPlan.getTopic() != null) {
            response.setTopic(
                    new SampleLessonPlanResponse.TopicInfo(
                            sampleLessonPlan.getTopic().getId(),
                            sampleLessonPlan.getTopic().getTitle()
                    )
            );
        }

        return response;
    }
}