package com.planbook.question_bank_service.specification;

import com.planbook.question_bank_service.entity.Question;
import org.springframework.data.jpa.domain.Specification;

public class QuestionSpecification {

    public static Specification<Question> hasSubject(String subject) {
        return (root, query, cb) ->
                subject == null || subject.isBlank()
                        ? cb.conjunction()
                        : cb.equal(root.get("subject"), subject);
    }

    public static Specification<Question> hasTopic(String topic) {
        return (root, query, cb) ->
                topic == null || topic.isBlank()
                        ? cb.conjunction()
                        : cb.equal(root.get("topic"), topic);
    }

    public static Specification<Question> hasSubjectId(Long subjectId) {
        return (root, query, cb) ->
                subjectId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("subjectId"), subjectId);
    }

    public static Specification<Question> hasChapterId(Long chapterId) {
        return (root, query, cb) ->
                chapterId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("chapterId"), chapterId);
    }

    public static Specification<Question> hasTopicId(Long topicId) {
        return (root, query, cb) ->
                topicId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("topicId"), topicId);
    }

    public static Specification<Question> hasDifficulty(String difficulty) {
        return (root, query, cb) ->
                difficulty == null || difficulty.isBlank()
                        ? cb.conjunction()
                        : cb.equal(root.get("difficultyLevel"), difficulty);
    }

    public static Specification<Question> hasStatus(String status) {
        return (root, query, cb) ->
                status == null || status.isBlank()
                        ? cb.conjunction()
                        : cb.equal(root.get("status"), status);
    }

    public static Specification<Question> contentContains(String keyword) {
        return (root, query, cb) ->
                keyword == null || keyword.isBlank()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("content")), "%" + keyword.toLowerCase() + "%");
    }
}
