package com.planbook.service;

import com.planbook.dto.CreateExamRequest;
import com.planbook.dto.ExamResponse;
import com.planbook.entity.Exam;
import com.planbook.repository.ExamRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public ExamResponse createExam(CreateExamRequest request) {
        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setTeacherId(request.getTeacherId());
        exam.setQuestionIds(request.getQuestionIds());
        exam.setAnswerKey(request.getAnswerKey());
        exam.setCreatedAt(LocalDateTime.now());

        exam = examRepository.save(exam);

        return new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getTeacherId(),
                exam.getQuestionIds(),
                exam.getAnswerKey(),
                exam.getCreatedAt()
        );
    }

    public List<ExamResponse> getExamsByTeacher(Long teacherId) {
        return examRepository.findByTeacherId(teacherId)
                .stream()
                .map(exam -> new ExamResponse(
                        exam.getId(),
                        exam.getTitle(),
                        exam.getTeacherId(),
                        exam.getQuestionIds(),
                        exam.getAnswerKey(),
                        exam.getCreatedAt()
                ))
                .toList();
    }
}