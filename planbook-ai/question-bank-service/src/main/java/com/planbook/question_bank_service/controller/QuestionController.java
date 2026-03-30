package com.planbook.question_bank_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.planbook.question_bank_service.entity.Question;
import com.planbook.question_bank_service.service.QuestionService;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // GET
    @GetMapping
    public List<Question> getAll() {
        return questionService.getAllQuestions();
    }

    // POST
    @PostMapping
    public Question create(@RequestBody Question question) {
        return questionService.saveQuestion(question);
    }
}