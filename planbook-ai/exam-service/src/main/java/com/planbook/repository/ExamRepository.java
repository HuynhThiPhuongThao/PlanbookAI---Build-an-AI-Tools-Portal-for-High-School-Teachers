package com.planbook.repository;

import com.planbook.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByTeacherId(Long teacherId);

    Optional<Exam> findByIdAndTeacherId(Long id, Long teacherId);
}