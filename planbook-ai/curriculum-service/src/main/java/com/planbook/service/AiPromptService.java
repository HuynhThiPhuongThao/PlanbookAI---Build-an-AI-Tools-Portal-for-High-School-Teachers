package com.planbook.service;

import com.planbook.dto.PromptDTO.PromptCreate;
import com.planbook.dto.PromptDTO.PromptResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AiPromptService {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public AiPromptService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Gọi API tạo prompt
    public PromptResponse createPrompt(PromptCreate request) {
        return restTemplate.postForObject(
            aiServiceUrl + "/api/ai/prompts",
            request,
            PromptResponse.class
        );
    }

    // Gọi API lấy prompt active theo name
    public PromptResponse getActivePrompt(String name) {
        return restTemplate.getForObject(
            aiServiceUrl + "/api/ai/prompts/active/" + name,
            PromptResponse.class
        );
    }

    // Gọi API lấy tất cả prompt
    public PromptResponse[] getAllPrompts() {
        return restTemplate.getForObject(
            aiServiceUrl + "/api/ai/prompts",
            PromptResponse[].class
        );
    }
}
