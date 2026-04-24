package com.planbook.service.admin;

import com.planbook.dto.admin.CurriculumTemplateRequest;
import com.planbook.dto.admin.CurriculumTemplateResponse;
import com.planbook.entity.admin.CurriculumTemplate;
import com.planbook.entity.staff.Subject;
import com.planbook.enums.TemplateStatus;
import com.planbook.repository.admin.CurriculumTemplateRepository;
import com.planbook.repository.staff.SubjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
public class CurriculumTemplateService {

    private final CurriculumTemplateRepository curriculumTemplateRepository;
    private final SubjectRepository subjectRepository;

    public CurriculumTemplateService(CurriculumTemplateRepository curriculumTemplateRepository,
                                     SubjectRepository subjectRepository) {
        this.curriculumTemplateRepository = curriculumTemplateRepository;
        this.subjectRepository = subjectRepository;
    }

    public CurriculumTemplateResponse createTemplate(CurriculumTemplateRequest request, Long adminId) {
        CurriculumTemplate template = new CurriculumTemplate();
        mapRequestToEntity(request, template);
        template.setCreatedBy(adminId);
        template.setUpdatedBy(adminId);

        CurriculumTemplate saved = curriculumTemplateRepository.save(template);
        return toResponse(saved);
    }

    public Page<CurriculumTemplateResponse> getAllTemplates(Pageable pageable) {
        return curriculumTemplateRepository.findAll(pageable)
                .map(this::toResponse);
    }

    public CurriculumTemplateResponse getTemplateById(Long id) {
        CurriculumTemplate template = curriculumTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Curriculum template not found with id: " + id));

        return toResponse(template);
    }

    public CurriculumTemplateResponse updateTemplate(Long id, CurriculumTemplateRequest request, Long adminId) {
        CurriculumTemplate template = curriculumTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Curriculum template not found with id: " + id));

        mapRequestToEntity(request, template);
        template.setUpdatedBy(adminId);

        CurriculumTemplate updated = curriculumTemplateRepository.save(template);
        return toResponse(updated);
    }

    public void deleteTemplate(Long id) {
        CurriculumTemplate template = curriculumTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Curriculum template not found with id: " + id));

        curriculumTemplateRepository.delete(template);
    }

    public List<CurriculumTemplateResponse> getActiveTemplates() {
        return curriculumTemplateRepository.findByStatus(TemplateStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void mapRequestToEntity(CurriculumTemplateRequest request, CurriculumTemplate template) {
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setGradeLevel(request.getGradeLevel());
        template.setStructureJson(request.getStructureJson());

        if (request.getStatus() != null) {
            template.setStatus(request.getStatus());
        } else if (template.getStatus() == null) {
            template.setStatus(TemplateStatus.ACTIVE);
        }

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new EntityNotFoundException("Subject not found with id: " + request.getSubjectId()));
            template.setSubject(subject);
        } else {
            template.setSubject(null);
        }
    }

    private CurriculumTemplateResponse toResponse(CurriculumTemplate template) {
        CurriculumTemplateResponse response = new CurriculumTemplateResponse();
        response.setId(template.getId());
        response.setName(template.getName());
        response.setDescription(template.getDescription());
        response.setGradeLevel(template.getGradeLevel());
        response.setStructureJson(template.getStructureJson());
        response.setStatus(template.getStatus());
        response.setCreatedBy(template.getCreatedBy());
        response.setUpdatedBy(template.getUpdatedBy());
        response.setCreatedAt(template.getCreatedAt());
        response.setUpdatedAt(template.getUpdatedAt());

        if (template.getSubject() != null) {
            response.setSubject(
                    new CurriculumTemplateResponse.SubjectInfo(
                            template.getSubject().getId(),
                            template.getSubject().getName()
                    )
            );
        }

        return response;
    }
}