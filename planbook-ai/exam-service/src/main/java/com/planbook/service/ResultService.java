package com.planbook.service;

import com.planbook.dto.ResultResponse;
import com.planbook.entity.Exam;
import com.planbook.repository.ExamRepository;
import com.planbook.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResultService {

    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;

    public ResultService(ResultRepository resultRepository,
                         ExamRepository examRepository) {
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
    }

    public List<ResultResponse> getResultsByExam(Long examId, Long teacherId) {
        Exam exam = examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new RuntimeException(
                        "Khong tim thay de thi hoac ban khong co quyen xem ket qua"
                ));

        return resultRepository.findByExamId(exam.getId())
                .stream()
                .map(result -> {
                    ResultResponse response = new ResultResponse();
                    response.setResultId(result.getId());
                    response.setSubmissionId(result.getSubmissionId());
                    response.setExamTitle(exam.getTitle());
                    response.setStudentName(result.getStudentName());
                    response.setScore(result.getScore());
                    response.setTotalQuestions(result.getTotalQuestions());
                    response.setCorrectCount(result.getCorrectCount());
                    response.setWrongQuestionIds(result.getWrongQuestionIds());
                    response.setFeedback(result.getFeedback());
                    response.setGradedAt(result.getGradedAt());
                    return response;
                })
                .toList();
    }
}
