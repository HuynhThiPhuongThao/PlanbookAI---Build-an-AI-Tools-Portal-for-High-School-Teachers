package com.planbook.question_bank_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.planbook.question_bank_service.entity.Question;
import com.planbook.question_bank_service.repository.QuestionRepository;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Question saveQuestion(Question question) {
        question.setStatus("PENDING");
        return questionRepository.save(question);
    }
}