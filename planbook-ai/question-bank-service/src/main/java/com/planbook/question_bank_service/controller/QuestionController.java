package com.planbook.question_bank_service.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.planbook.question_bank_service.entity.Question;
import com.planbook.question_bank_service.service.QuestionService;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @PostMapping
    public Question createQuestion(@RequestBody Question question) {
        return questionService.saveQuestion(question);
    }
}