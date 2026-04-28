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
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class SampleLessonPlanService {

    private final SampleLessonPlanRepository sampleLessonPlanRepository;
    private final CurriculumTemplateRepository curriculumTemplateRepository;
    private final TopicRepository topicRepository;
    private final com.planbook.service.FirebaseNotificationService firebaseNotificationService;
    private final RestTemplate restTemplate;

    public SampleLessonPlanService(
            SampleLessonPlanRepository sampleLessonPlanRepository,
            CurriculumTemplateRepository curriculumTemplateRepository,
            TopicRepository topicRepository,
            com.planbook.service.FirebaseNotificationService firebaseNotificationService,
            RestTemplate restTemplate
    ) {
        this.sampleLessonPlanRepository = sampleLessonPlanRepository;
        this.curriculumTemplateRepository = curriculumTemplateRepository;
        this.topicRepository = topicRepository;
        this.firebaseNotificationService = firebaseNotificationService;
        this.restTemplate = restTemplate;
    }

    public SampleLessonPlanResponse createSample(SampleLessonPlanRequest request, Long staffId) {
        if (request.getTopicId() == null) {
            throw new IllegalArgumentException("Topic ID is required when creating a sample lesson plan");
        }

        CurriculumTemplate curriculumTemplate = resolveOptionalTemplate(request.getCurriculumTemplateId());
        Topic topic = resolveTopic(request.getTopicId());

        SampleLessonPlan sampleLessonPlan = new SampleLessonPlan();
        sampleLessonPlan.setTitle(request.getTitle());
        sampleLessonPlan.setContent(request.getContent());
        sampleLessonPlan.setCurriculumTemplate(curriculumTemplate);
        sampleLessonPlan.setTopic(topic);
        sampleLessonPlan.setStaffId(staffId);
        sampleLessonPlan.setStatus(SampleLessonPlanStatus.DRAFT);

        SampleLessonPlan saved = sampleLessonPlanRepository.save(sampleLessonPlan);
        return toResponse(saved);
    }

    public List<SampleLessonPlanResponse> getMySamples(Long staffId) {
        return sampleLessonPlanRepository.findByStaffId(staffId).stream().map(this::toResponse).toList();
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

        sampleLessonPlan.setTitle(request.getTitle());
        sampleLessonPlan.setContent(request.getContent());

        if (request.getCurriculumTemplateId() != null) {
            sampleLessonPlan.setCurriculumTemplate(resolveOptionalTemplate(request.getCurriculumTemplateId()));
        }

        if (request.getTopicId() != null) {
            sampleLessonPlan.setTopic(resolveTopic(request.getTopicId()));
        }

        SampleLessonPlan updated = sampleLessonPlanRepository.save(sampleLessonPlan);
        return toResponse(updated);
    }

    public void deleteSample(Long id, Long staffId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (!sampleLessonPlan.getStaffId().equals(staffId)) {
            throw new AccessDeniedException("You do not have permission to delete this sample lesson plan");
        }

        if (sampleLessonPlan.getStatus() == SampleLessonPlanStatus.APPROVED) {
            throw new IllegalStateException("Cannot delete an approved sample lesson plan");
        }

        sampleLessonPlanRepository.delete(sampleLessonPlan);
    }

    public SampleLessonPlanResponse submitForReview(Long id, Long staffId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (!sampleLessonPlan.getStaffId().equals(staffId)) {
            throw new AccessDeniedException("You do not have permission to submit this sample lesson plan");
        }

        if (sampleLessonPlan.getStatus() != SampleLessonPlanStatus.DRAFT
                && sampleLessonPlan.getStatus() != SampleLessonPlanStatus.REJECTED) {
            throw new IllegalStateException("Only draft or rejected sample lesson plans can be submitted for review");
        }

        sampleLessonPlan.setStatus(SampleLessonPlanStatus.PENDING_REVIEW);
        SampleLessonPlan updated = sampleLessonPlanRepository.save(sampleLessonPlan);

        notifyManagersForReview(updated);

        return toResponse(updated);
    }

    private void notifyManagersForReview(SampleLessonPlan sampleLessonPlan) {
        try {
            String tokenUrl = "http://user-service:8082/api/users/internal/managers/fcm-tokens";
            String[] managerTokens = restTemplate.getForObject(tokenUrl, String[].class);

            if (managerTokens == null || managerTokens.length == 0) {
                System.out.println("🔥 [Firebase] Chưa có Manager nào đăng ký FCM token.");
                return;
            }

            firebaseNotificationService.sendNotificationToMany(
                    List.of(managerTokens),
                    "Có giáo án mẫu mới cần duyệt",
                    "Staff vừa gửi duyệt giáo án: " + sampleLessonPlan.getTitle()
            );
        } catch (Exception e) {
            System.err.println("❌ Không thể lấy danh sách FCM Token của Manager: " + e.getMessage());
        }
    }

    private CurriculumTemplate resolveOptionalTemplate(Long templateId) {
        if (templateId == null) {
            return null;
        }
        return curriculumTemplateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("Curriculum template not found with id: " + templateId));
    }

    private Topic resolveTopic(Long topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("Topic not found with id: " + topicId));
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
