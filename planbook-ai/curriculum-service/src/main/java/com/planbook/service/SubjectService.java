package com.planbook.service;

import com.planbook.dto.SubjectResponse;
import com.planbook.entity.Subject;
import com.planbook.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public SubjectResponse getSubjectById(Long id) {
            Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subject not found with id " + id));
        return toResponse(subject);
    }

    private SubjectResponse toResponse(Subject subject) {
        SubjectResponse response = new SubjectResponse();
        response.setId(subject.getId());
        response.setName(subject.getName());
        response.setDescription(subject.getDescription());
        return response;
    }
}
