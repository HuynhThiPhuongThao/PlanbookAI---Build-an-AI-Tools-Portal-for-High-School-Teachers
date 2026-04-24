package com.planbook.service.staff;

import com.planbook.dto.staff.SampleLessonPlanRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.entity.admin.CurriculumTemplate;
import com.planbook.entity.staff.SampleLessonPlan;
import com.planbook.entity.staff.Topic;
import com.planbook.enums.SampleLessonPlanStatus;
import com.planbook.repository.admin.CurriculumTemplateRepository;
import com.planbook.repository.staff.SampleLessonPlanRepository;
import com.planbook.repository.staff.TopicRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SampleLessonPlanService {

    private final SampleLessonPlanRepository sampleLessonPlanRepository;
    private final CurriculumTemplateRepository curriculumTemplateRepository;
    private final TopicRepository topicRepository;
    private final com.planbook.service.FirebaseNotificationService firebaseNotificationService;

    public SampleLessonPlanService(SampleLessonPlanRepository sampleLessonPlanRepository,
                                   CurriculumTemplateRepository curriculumTemplateRepository,
                                   TopicRepository topicRepository,
                                   com.planbook.service.FirebaseNotificationService firebaseNotificationService) {
        this.sampleLessonPlanRepository = sampleLessonPlanRepository;
        this.curriculumTemplateRepository = curriculumTemplateRepository;
        this.topicRepository = topicRepository;
        this.firebaseNotificationService = firebaseNotificationService;
    }

    public SampleLessonPlanResponse createSample(SampleLessonPlanRequest request, Long staffId) {
        // curriculumTemplateId là optional — staff có thể lưu không cần template
        CurriculumTemplate curriculumTemplate = null;
        if (request.getCurriculumTemplateId() != null) {
            curriculumTemplate = curriculumTemplateRepository.findById(request.getCurriculumTemplateId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Curriculum template not found with id: " + request.getCurriculumTemplateId()
                    ));
        }

        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Topic not found with id: " + request.getTopicId()
                ));

        SampleLessonPlan sampleLessonPlan = new SampleLessonPlan();
        sampleLessonPlan.setTitle(request.getTitle());
        sampleLessonPlan.setContent(request.getContent());
        sampleLessonPlan.setCurriculumTemplate(curriculumTemplate); // null nếu không có
        sampleLessonPlan.setTopic(topic);
        sampleLessonPlan.setStaffId(staffId);
        sampleLessonPlan.setStatus(SampleLessonPlanStatus.DRAFT);

        SampleLessonPlan saved = sampleLessonPlanRepository.save(sampleLessonPlan);
        return toResponse(saved);
    }


    public List<SampleLessonPlanResponse> getMySamples(Long staffId) {
        return sampleLessonPlanRepository.findByStaffId(staffId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SampleLessonPlanResponse getSampleById(Long id, Long staffId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
.orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (!sampleLessonPlan.getStaffId().equals(staffId)) {
            throw new AccessDeniedException("You do not have permission to view this sample lesson plan");
        }

        return toResponse(sampleLessonPlan);
    }

    public SampleLessonPlanResponse updateSample(Long id, SampleLessonPlanRequest request, Long staffId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (!sampleLessonPlan.getStaffId().equals(staffId)) {
            throw new AccessDeniedException("You do not have permission to update this sample lesson plan");
        }

        if (sampleLessonPlan.getStatus() == SampleLessonPlanStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Cannot update sample lesson plan while it is pending review");
        }

        CurriculumTemplate curriculumTemplate = curriculumTemplateRepository.findById(request.getCurriculumTemplateId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Curriculum template not found with id: " + request.getCurriculumTemplateId()
                ));

        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Topic not found with id: " + request.getTopicId()
                ));

        sampleLessonPlan.setTitle(request.getTitle());
        sampleLessonPlan.setContent(request.getContent());
        sampleLessonPlan.setCurriculumTemplate(curriculumTemplate);
        sampleLessonPlan.setTopic(topic);

        SampleLessonPlan updated = sampleLessonPlanRepository.save(sampleLessonPlan);
        return toResponse(updated);
    }

    public void deleteSample(Long id, Long staffId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (!sampleLessonPlan.getStaffId().equals(staffId)) {
            throw new AccessDeniedException("You do not have permission to delete this sample lesson plan");
        }

        if (sampleLessonPlan.getStatus() == SampleLessonPlanStatus.PENDING_REVIEW ||
            sampleLessonPlan.getStatus() == SampleLessonPlanStatus.APPROVED) {
            throw new IllegalStateException("Cannot delete sample lesson plan in current status");
        }

        sampleLessonPlanRepository.delete(sampleLessonPlan);
    }

    public SampleLessonPlanResponse submitForReview(Long id, Long staffId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));
if (!sampleLessonPlan.getStaffId().equals(staffId)) {
            throw new AccessDeniedException("You do not have permission to submit this sample lesson plan");
        }

        if (sampleLessonPlan.getStatus() != SampleLessonPlanStatus.DRAFT &&
            sampleLessonPlan.getStatus() != SampleLessonPlanStatus.REJECTED) {
            throw new IllegalStateException("Only draft or rejected sample lesson plans can be submitted for review");
        }

        sampleLessonPlan.setStatus(SampleLessonPlanStatus.PENDING_REVIEW);
        SampleLessonPlan updated = sampleLessonPlanRepository.save(sampleLessonPlan);

        // TODO: Đoạn này lấy Token thật của Manager từ Database ra (hiện tại giả lập)
        System.out.println("🔥 [Firebase] Chuẩn bị bắn Firebase tới Manager...");
        String dummyManagerToken = "DUMMY_TOKEN_TU_FRONTEND_XUONG"; 
        firebaseNotificationService.sendNotification(dummyManagerToken, 
            "Giáo án cần duyệt mới!", 
            "Staff vừa gửi duyệt: " + sampleLessonPlan.getTitle()
        );

        return toResponse(updated);
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