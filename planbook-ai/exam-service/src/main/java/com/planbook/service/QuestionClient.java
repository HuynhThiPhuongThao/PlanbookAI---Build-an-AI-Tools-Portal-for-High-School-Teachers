package com.planbook.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.util.UriComponentsBuilder;

import com.planbook.dto.QuestionDTO;

import java.util.List;

@Component
public class QuestionClient {

    private final RestTemplate restTemplate;

    @Value("${questionbank.service.url}")
    private String questionbankServiceUrl;

    public QuestionClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<QuestionDTO> getQuestions(Long topicId, String difficultyLevel) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder
                .fromHttpUrl(questionbankServiceUrl + "/api/questions")
                .queryParam("size", 100);

        if (topicId != null) {
            uriBuilder.queryParam("topicId", topicId);
        }
        if (difficultyLevel != null && !difficultyLevel.isBlank()) {
            uriBuilder.queryParam("difficultyLevel", difficultyLevel);
        }
        uriBuilder.queryParam("status", "APPROVED");

        HttpHeaders headers = new HttpHeaders();
        String authorization = getCurrentAuthorizationHeader();
        if (authorization != null && !authorization.isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, authorization);
        }

        ResponseEntity<QuestionBankApiResponse> response = restTemplate.exchange(
                uriBuilder.toUriString(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                QuestionBankApiResponse.class
        );

        QuestionBankApiResponse body = response.getBody();
        if (body == null || body.getData() == null || body.getData().getContent() == null) {
            return List.of();
        }

        return body.getData().getContent();
    }

    private String getCurrentAuthorizationHeader() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
        }
        return null;
    }

    public static class QuestionBankApiResponse {
        private QuestionBankPage data;

        public QuestionBankPage getData() {
            return data;
        }

        public void setData(QuestionBankPage data) {
            this.data = data;
        }
    }

    public static class QuestionBankPage {
        private List<QuestionDTO> content;

        public List<QuestionDTO> getContent() {
            return content;
        }

        public void setContent(List<QuestionDTO> content) {
            this.content = content;
        }
    }
}
