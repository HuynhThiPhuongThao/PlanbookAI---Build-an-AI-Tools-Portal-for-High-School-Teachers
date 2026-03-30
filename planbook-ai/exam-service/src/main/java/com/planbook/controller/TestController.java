package com.planbook.controller;

import com.planbook.entity.Test;
import com.planbook.repository.TestRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestRepository testRepository;

    public TestController(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    @GetMapping
    public List<Test> getTests() {
        return testRepository.findAll();
    }

    @PostMapping
    public Test addTest(@RequestBody Test test) {
        return testRepository.save(test);
    }
}