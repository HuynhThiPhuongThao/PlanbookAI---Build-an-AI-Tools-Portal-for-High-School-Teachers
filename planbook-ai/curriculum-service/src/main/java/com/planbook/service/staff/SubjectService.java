package com.planbook.service.staff;

import com.planbook.dto.staff.SubjectResponse;
import com.planbook.dto.staff.SubjectRequest;
import com.planbook.entity.staff.Subject;
import com.planbook.repository.staff.SubjectRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public Page<SubjectResponse> getAllSubjects(Pageable pageable) {
        return subjectRepository.findAll(pageable)
                .map(this::toResponse);
    }

    public SubjectResponse getSubjectById(Long id) {
            Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id " + id));
        return toResponse(subject);
    }

    public SubjectResponse createSubject(SubjectRequest request) {
        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject = subjectRepository.save(subject);
        return toResponse(subject);
    }

    public SubjectResponse updateSubject(Long id, SubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id " + id));
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        subject = subjectRepository.save(subject);
        return toResponse(subject);
    }

    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new EntityNotFoundException("Subject not found with id " + id);
        }
        subjectRepository.deleteById(id);
    }

    private SubjectResponse toResponse(Subject subject) {
        SubjectResponse response = new SubjectResponse();
        response.setId(subject.getId());
        response.setName(subject.getName());
        response.setDescription(subject.getDescription());
        return response;
    }
}
