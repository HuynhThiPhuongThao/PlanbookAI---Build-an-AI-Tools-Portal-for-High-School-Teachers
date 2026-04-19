package com.planbook.repository.admin;

import com.planbook.entity.admin.CurriculumTemplate;
import com.planbook.enums.TemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CurriculumTemplateRepository extends JpaRepository<CurriculumTemplate, Long> {

    List<CurriculumTemplate> findByStatus(TemplateStatus status);

    List<CurriculumTemplate> findBySubjectIdAndStatus(Long subjectId, TemplateStatus status);
}