package com.planbook.service;

import com.planbook.entity.Curriculum;
import com.planbook.repository.CurriculumRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

@Service
public class CurriculumService {

    private final CurriculumRepository curriculumRepository;

    public CurriculumService(CurriculumRepository curriculumRepository) {
        this.curriculumRepository = curriculumRepository;
    }

    public List<Curriculum> getAllCurriculums() {
        return curriculumRepository.findAll();
    }

    public Optional<Curriculum> getCurriculumById(Long id) {
        return curriculumRepository.findById(id);
    }

    public Curriculum addCurriculum(Curriculum curriculum) {
        return curriculumRepository.save(curriculum);
    }

    public Curriculum updateCurriculum(Long id, Curriculum curriculumDetails) {
        return curriculumRepository.findById(id)
                .map(curriculum -> {
                    curriculum.setName(curriculumDetails.getName());
                    curriculum.setDescription(curriculumDetails.getDescription());
                    curriculum.setStartDate(curriculumDetails.getStartDate());
                    curriculum.setEndDate(curriculumDetails.getEndDate());
                    return curriculumRepository.save(curriculum);
                })
                .orElseThrow(() -> new EntityNotFoundException("Curriculum not found with id " + id));
    }

    public void deleteCurriculum(Long id) {
    Curriculum existing = curriculumRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Curriculum not found with id " + id));
    curriculumRepository.delete(existing);
}

}
