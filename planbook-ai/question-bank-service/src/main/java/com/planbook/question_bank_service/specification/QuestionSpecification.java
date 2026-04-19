package com.planbook.question_bank_service.specification;

import com.planbook.question_bank_service.entity.Question;
import org.springframework.data.jpa.domain.Specification;

public class QuestionSpecification {
    
    public static Specification<Question> hasSubject(String subject) {
        return (root, query, criteriaBuilder) -> 
            subject == null ? criteriaBuilder.conjunction() : 
            criteriaBuilder.equal(root.get("subject"), subject);
    }
    
    public static Specification<Question> hasTopic(String topic) {
        return (root, query, criteriaBuilder) -> 
            topic == null ? criteriaBuilder.conjunction() : 
            criteriaBuilder.equal(root.get("topic"), topic);
    }
    
    public static Specification<Question> hasDifficulty(String difficulty) {
        return (root, query, criteriaBuilder) -> 
            difficulty == null ? criteriaBuilder.conjunction() : 
            criteriaBuilder.equal(root.get("difficultyLevel"), difficulty);
    }
    
    public static Specification<Question> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> 
            status == null ? criteriaBuilder.conjunction() : 
            criteriaBuilder.equal(root.get("status"), status);
    }
    
    public static Specification<Question> contentContains(String keyword) {
        return (root, query, criteriaBuilder) -> 
            keyword == null ? criteriaBuilder.conjunction() : 
            criteriaBuilder.like(root.get("content"), "%" + keyword + "%");
    }
}