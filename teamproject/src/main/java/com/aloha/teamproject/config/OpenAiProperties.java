package com.aloha.teamproject.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Component
@Slf4j
@ConfigurationProperties(prefix = "openai")
public class OpenAiProperties {

    private String apiKey;
    private String model = "gpt-4o-mini";
    private String apiUrl = "https://api.openai.com/v1/chat/completions";
    private double temperature = 0.4d;
    private int maxTokens = 800;

    @PostConstruct
    public void logKeyPresence() {
        boolean hasApiKey = apiKey != null && !apiKey.isBlank();
        log.info("[OpenAI] apiKey set: {}, model: {}", hasApiKey, model);
    }
}

