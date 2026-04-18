package com.planbook.question_bank_service.repository;

import com.planbook.question_bank_service.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    
    Page<Question> findByStatus(String status, Pageable pageable);
    
    Page<Question> findByAuthorId(Long authorId, Pageable pageable);
    
    Page<Question> findBySubjectAndStatus(String subject, String status, Pageable pageable);
    
    Page<Question> findBySubjectAndTopicAndStatus(String subject, String topic, String status, Pageable pageable);
    
    @Query("SELECT q FROM Question q WHERE q.status = 'PENDING'")
    List<Question> findAllPendingQuestions();
    
    boolean existsByIdAndAuthorId(Long id, Long authorId);
}