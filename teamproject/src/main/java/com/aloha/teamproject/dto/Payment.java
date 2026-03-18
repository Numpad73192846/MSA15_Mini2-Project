package com.aloha.teamproject.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    private String id;
    private String userId;
    private String bookingId;
    private BigDecimal amount;
    private String provider;
    private String status;
    private LocalDateTime paidAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String bookingId;
        private BigDecimal amount;
        private String provider;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private String bookingId;
        private BigDecimal amount;
        private String provider;
        private String status;
        private LocalDateTime paidAt;
        private String bookingTitle;
    }
}
