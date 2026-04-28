package com.planbook.service;

import com.planbook.dto.OcrGradeResponse;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;
    private final OcrGradingClient ocrGradingClient;

    public SubmissionService(SubmissionRepository submissionRepository,
                             ResultRepository resultRepository,
                             ExamRepository examRepository,
                             OcrGradingClient ocrGradingClient) {
        this.submissionRepository = submissionRepository;
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
        this.ocrGradingClient = ocrGradingClient;
    }

    public SubmissionResponse submitExam(Long examId,
                                         Long teacherId,
                                         String studentName,
                                         MultipartFile image) throws IOException {

        Exam exam = examRepository.findByIdAndTeacherId(examId, teacherId)
                .orElseThrow(() -> new RuntimeException(
                        "Khong tim thay de thi hoac ban khong co quyen truy cap de thi nay"
                ));

        Path uploadDir = Path.of(System.getProperty("java.io.tmpdir"), "planbook-exam-uploads");
        Files.createDirectories(uploadDir);

        String originalName = image.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("File ảnh không hợp lệ hoặc không có tên file");
        }
        if (image.isEmpty()) {
            throw new IllegalArgumentException("File ảnh rỗng, vui lòng chọn ảnh bài làm khác");
        }

        String safeOriginalName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = UUID.randomUUID() + "_" + safeOriginalName;
        Path uploadPath = uploadDir.resolve(fileName).toAbsolutePath().normalize();
        String filePath = uploadPath.toString();

        Files.copy(image.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);

        Submission submission = new Submission();
        submission.setExamId(exam.getId());
        submission.setStudentName(studentName);
        submission.setImagePath(filePath);
        submission.setStatus("PROCESSING");
        submission.setSubmittedAt(LocalDateTime.now());
        submission = submissionRepository.save(submission);

        try {
            List<String> answerKey = parseAnswerKey(exam.getAnswerKey());
            OcrGradeResponse ocrResult = ocrGradingClient.gradeSubmission(new File(filePath), answerKey);
            if (ocrResult == null) {
                throw new RuntimeException("Không nhận được kết quả chấm OCR từ ai-service");
            }

            submission.setStatus("GRADED");
            submission = submissionRepository.save(submission);

            Result result = new Result();
            result.setExamId(exam.getId());
            result.setSubmissionId(submission.getId());
            result.setStudentName(studentName);
            result.setScore(ocrResult.getScore());
            result.setTotalQuestions(ocrResult.getTotalQuestions());
            result.setCorrectCount(ocrResult.getCorrectCount());
            result.setWrongQuestionIds(formatWrongQuestionIds(ocrResult.getWrongQuestionIds()));
            result.setFeedback(buildFeedback(ocrResult));
            result.setGradedAt(LocalDateTime.now());
            result = resultRepository.save(result);

            SubmissionResponse response = new SubmissionResponse(
                    submission.getId(),
                    submission.getStudentName(),
                    submission.getStatus(),
                    result.getScore(),
                    result.getFeedback(),
                    submission.getSubmittedAt()
            );
            response.setTotalQuestions(result.getTotalQuestions());
            response.setCorrectCount(result.getCorrectCount());
            response.setWrongQuestionIds(result.getWrongQuestionIds());
            return response;
        } catch (RuntimeException ex) {
            submission.setStatus("FAILED");
            submissionRepository.save(submission);
            throw ex;
        }
    }

    private List<String> parseAnswerKey(String answerKeyText) {
        if (answerKeyText == null || answerKeyText.isBlank()) {
            throw new IllegalStateException("Đề thi chưa có đáp án để chấm OCR");
        }
        return List.of(answerKeyText.split(","))
                .stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private String formatWrongQuestionIds(List<Integer> wrongQuestionIds) {
        if (wrongQuestionIds == null || wrongQuestionIds.isEmpty()) {
            return "";
        }
        return wrongQuestionIds.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    private String buildFeedback(OcrGradeResponse ocrResult) {
        if (ocrResult.getWrongQuestionIds() == null || ocrResult.getWrongQuestionIds().isEmpty()) {
            return "Lam bai rat tot. Khong co cau nao sai.";
        }

        return String.format(
                "Dung %d/%d cau. Sai cac cau: %s.",
                ocrResult.getCorrectCount(),
                ocrResult.getTotalQuestions(),
                formatWrongQuestionIds(ocrResult.getWrongQuestionIds())
        );
    }
}
