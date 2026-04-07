package com.planbook.service;

import com.planbook.dto.ResultResponse;
import com.planbook.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResultService {

    private final ResultRepository resultRepository;

    public ResultService(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    public List<ResultResponse> getResultsByExam(Long examId) {
        return resultRepository.findByExamId(examId)
                .stream()
                .map(result -> new ResultResponse(
                        result.getId(),
                        result.getSubmissionId(),
                        result.getStudentName(),
                        result.getScore(),
                        result.getWrongQuestionIds(),
                        result.getFeedback(),
                        result.getGradedAt()
                ))
                .toList();
    }
}