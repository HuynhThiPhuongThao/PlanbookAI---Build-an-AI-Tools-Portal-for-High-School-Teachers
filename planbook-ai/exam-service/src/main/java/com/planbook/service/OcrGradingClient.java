package com.planbook.service;

import com.planbook.dto.OcrGradeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.List;

@Component
public class OcrGradingClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public OcrGradingClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public OcrGradeResponse gradeSubmission(File imageFile, List<String> answerKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", createImagePart(imageFile));
        body.add("answer_key", createTextPart(String.join(",", answerKey)));

        try {
            ResponseEntity<OcrGradeResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/ocr-grade",
                    new HttpEntity<>(body, headers),
                    OcrGradeResponse.class
            );

            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            String responseBody = ex.getResponseBodyAsString();
            throw new RuntimeException(
                    "OCR failed at ai-service. HTTP " + ex.getStatusCode().value()
                            + ". Response: " + responseBody,
                    ex
            );
        } catch (ResourceAccessException ex) {
            throw new RuntimeException(
                    "OCR failed because exam-service could not reach ai-service at "
                            + aiServiceUrl + ". Root cause: " + ex.getMessage(),
                    ex
            );
        }
    }

    private HttpEntity<FileSystemResource> createImagePart(File imageFile) {
        HttpHeaders imageHeaders = new HttpHeaders();
        imageHeaders.setContentType(resolveImageMediaType(imageFile.getName()));
        imageHeaders.setContentDispositionFormData("image", imageFile.getName());
        return new HttpEntity<>(new FileSystemResource(imageFile), imageHeaders);
    }

    private HttpEntity<String> createTextPart(String value) {
        HttpHeaders textHeaders = new HttpHeaders();
        textHeaders.setContentType(MediaType.TEXT_PLAIN);
        return new HttpEntity<>(value, textHeaders);
    }

    private MediaType resolveImageMediaType(String fileName) {
        String lowerName = fileName == null ? "" : fileName.toLowerCase();
        if (lowerName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        return MediaType.IMAGE_JPEG;
    }
}
