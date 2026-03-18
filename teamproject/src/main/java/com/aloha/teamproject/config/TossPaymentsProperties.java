package com.aloha.teamproject.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Component
@Slf4j
@ConfigurationProperties(prefix = "toss.payments")
public class TossPaymentsProperties {
    private String clientKey;
    private String secretKey;

    @PostConstruct
    public void logKeyPresence() {
        boolean hasClientKey = clientKey != null && !clientKey.isBlank();
        boolean hasSecretKey = secretKey != null && !secretKey.isBlank();
        log.info("[TossPayments] clientKey set: {}, secretKey set: {}", hasClientKey, hasSecretKey);
    }
}
