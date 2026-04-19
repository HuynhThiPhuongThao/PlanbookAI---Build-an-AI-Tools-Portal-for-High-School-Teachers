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
                        "Không tìm thấy đề thi hoặc bạn không có quyền xem kết quả"
                ));

        return resultRepository.findByExamId(exam.getId())
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