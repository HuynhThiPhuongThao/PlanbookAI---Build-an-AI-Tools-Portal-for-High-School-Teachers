package com.planbook.service.manager;

import com.planbook.dto.manager.SampleLessonPlanReviewRequest;
import com.planbook.dto.staff.SampleLessonPlanResponse;
import com.planbook.entity.staff.SampleLessonPlan;
import com.planbook.enums.SampleLessonPlanStatus;
import com.planbook.repository.staff.SampleLessonPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
public class SampleLessonPlanReviewService {

    private final SampleLessonPlanRepository sampleLessonPlanRepository;
    private final com.planbook.service.FirebaseNotificationService firebaseNotificationService;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public SampleLessonPlanReviewService(SampleLessonPlanRepository sampleLessonPlanRepository,
                                         com.planbook.service.FirebaseNotificationService firebaseNotificationService,
                                         org.springframework.web.client.RestTemplate restTemplate) {
        this.sampleLessonPlanRepository = sampleLessonPlanRepository;
        this.firebaseNotificationService = firebaseNotificationService;
        this.restTemplate = restTemplate;
    }

    public List<SampleLessonPlanResponse> getPendingSamples() {
        return sampleLessonPlanRepository.findByStatus(SampleLessonPlanStatus.PENDING_REVIEW)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Cache review history to reduce repeated DB reads.
    @Cacheable(value = "reviewHistoryCache")
    public List<SampleLessonPlanResponse> getReviewHistory() {
        return sampleLessonPlanRepository.findByStatusInOrderByUpdatedAtDesc(
                    Arrays.asList(SampleLessonPlanStatus.APPROVED, SampleLessonPlanStatus.REJECTED)
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Clear review history cache after status changes.
    @CacheEvict(value = "reviewHistoryCache", allEntries = true)
    public SampleLessonPlanResponse approveSample(Long id, SampleLessonPlanReviewRequest request, Long managerId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (sampleLessonPlan.getStatus() != SampleLessonPlanStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Only sample lesson plans in PENDING_REVIEW status can be approved");
        }

        sampleLessonPlan.setStatus(SampleLessonPlanStatus.APPROVED);
        sampleLessonPlan.setReviewNote(request.getReviewNote());
        sampleLessonPlan.setReviewedBy(managerId);
        sampleLessonPlan.setReviewedAt(LocalDateTime.now());

        SampleLessonPlan updated = sampleLessonPlanRepository.save(sampleLessonPlan);
        
        // Push Firebase notification to staff.
        System.out.println("[Firebase] Sending approval notification to staff.");
        try {
            String tokenUrl = "http://user-service:8082/api/users/internal/" + updated.getStaffId() + "/fcm-token";
            String staffFcmToken = restTemplate.getForObject(tokenUrl, String.class);
            if (staffFcmToken != null && !staffFcmToken.trim().isEmpty()) {
                firebaseNotificationService.sendNotification(staffFcmToken,
                    "[DA DUYET] Giao an cua ban",
                    "Giao an da duoc duyet: " + updated.getTitle(),
                    com.planbook.service.FirebaseNotificationService.TYPE_CONTENT_APPROVED,
                    Map.of(
                            "lessonPlanId", String.valueOf(updated.getId()),
                            "lessonPlanTitle", updated.getTitle() == null ? "" : updated.getTitle()
                    )
                );
            }
        } catch (Exception e) {
            System.err.println("[Firebase] Could not get staff FCM token: " + e.getMessage());
        }

        return toResponse(updated);
    }

    // Clear review history cache after status changes.
    @CacheEvict(value = "reviewHistoryCache", allEntries = true)
    public SampleLessonPlanResponse rejectSample(Long id, SampleLessonPlanReviewRequest request, Long managerId) {
        SampleLessonPlan sampleLessonPlan = sampleLessonPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sample lesson plan not found with id: " + id));

        if (sampleLessonPlan.getStatus() != SampleLessonPlanStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Only sample lesson plans in PENDING_REVIEW status can be rejected");
        }

        sampleLessonPlan.setStatus(SampleLessonPlanStatus.REJECTED);
        sampleLessonPlan.setReviewNote(request.getReviewNote());
        sampleLessonPlan.setReviewedBy(managerId);
        sampleLessonPlan.setReviewedAt(LocalDateTime.now());

        SampleLessonPlan updated = sampleLessonPlanRepository.save(sampleLessonPlan);
        
        // Push Firebase notification to staff.
        System.out.println("[Firebase] Sending rejection notification to staff.");
        try {
            String tokenUrl = "http://user-service:8082/api/users/internal/" + updated.getStaffId() + "/fcm-token";
            String staffFcmToken = restTemplate.getForObject(tokenUrl, String.class);
            if (staffFcmToken != null && !staffFcmToken.trim().isEmpty()) {
                firebaseNotificationService.sendNotification(staffFcmToken,
                    "[TU CHOI] Giao an can chinh sua",
                    "Ly do: " + request.getReviewNote() + " - Bai: " + updated.getTitle(),
                    com.planbook.service.FirebaseNotificationService.TYPE_CONTENT_REJECTED,
                    Map.of(
                            "lessonPlanId", String.valueOf(updated.getId()),
                            "lessonPlanTitle", updated.getTitle() == null ? "" : updated.getTitle(),
                            "reviewNote", request.getReviewNote() == null ? "" : request.getReviewNote()
                    )
                );
            }
        } catch (Exception e) {
            System.err.println("[Firebase] Could not get staff FCM token: " + e.getMessage());
        }

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

