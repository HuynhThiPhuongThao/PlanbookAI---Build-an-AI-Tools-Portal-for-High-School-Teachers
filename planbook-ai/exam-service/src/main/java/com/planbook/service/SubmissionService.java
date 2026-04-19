package com.planbook.service;

import com.planbook.dto.SubmissionResponse;
import com.planbook.entity.Exam;
import com.planbook.entity.Result;
import com.planbook.entity.Submission;
import com.planbook.repository.ExamRepository;
import com.planbook.repository.ResultRepository;
import com.planbook.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;

    public SubmissionService(SubmissionRepository submissionRepository,
                             ResultRepository resultRepository,
                             ExamRepository examRepository) {
        this.submissionRepository = submissionRepository;
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
    }

    public SubmissionResponse submitExam(Long examId,
                                         Long teacherId,
                                         String studentName,
                                         MultipartFile image) throws IOException {

        Exam exam = examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đề thi hoặc bạn không có quyền truy cập đề thi này"
                ));

        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
        File folder = new File(uploadDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String originalName = image.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("File ảnh không hợp lệ hoặc không có tên file");
        }

        String fileName = UUID.randomUUID() + "_" + originalName;
        String filePath = uploadDir + File.separator + fileName;

        image.transferTo(new File(filePath));

        Submission submission = new Submission();
        submission.setExamId(exam.getId());
        submission.setStudentName(studentName);
        submission.setImagePath(filePath);
        submission.setStatus("GRADED");
        submission.setSubmittedAt(LocalDateTime.now());
        submission = submissionRepository.save(submission);

        Result result = new Result();
        result.setExamId(exam.getId());
        result.setSubmissionId(submission.getId());
        result.setStudentName(studentName);
        result.setScore(8.5);
        result.setWrongQuestionIds("2,5");
        result.setFeedback("Bài làm khá tốt, sai câu 2 và 5");
        result.setGradedAt(LocalDateTime.now());
        result = resultRepository.save(result);

        return new SubmissionResponse(
                submission.getId(),
                submission.getStudentName(),
                submission.getStatus(),
                result.getScore(),
                result.getFeedback(),
                submission.getSubmittedAt()
        );
    }
}