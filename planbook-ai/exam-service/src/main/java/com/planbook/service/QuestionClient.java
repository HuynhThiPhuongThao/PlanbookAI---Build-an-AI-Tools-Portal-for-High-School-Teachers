package com.planbook.service;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import com.planbook.dto.QuestionDTO;

import java.util.Arrays;
import java.util.List;

@Component
public class QuestionClient {

    private final RestTemplate restTemplate;

@Value("${questionbank.service.url}")
    private String questionbankServiceUrl;


    public QuestionClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<QuestionDTO> getQuestions(Long topicId, String level) {
        String url = questionbankServiceUrl + "/api/questions?topicId=" + topicId + "&level=" + level;

        QuestionDTO[] response = restTemplate.getForObject(url, QuestionDTO[].class);
        return Arrays.asList(response);
    }
}