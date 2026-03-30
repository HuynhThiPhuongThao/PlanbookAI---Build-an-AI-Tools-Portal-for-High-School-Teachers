package com.planbook.question_bank_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.planbook.question_bank_service.entity.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
}