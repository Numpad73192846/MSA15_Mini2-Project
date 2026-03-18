package com.aloha.teamproject.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    
    private String id;
    private String userId;
    private String subjectId;
    private String title;
    private String description;
    private String status;
    private BigDecimal price;
    private String fieldId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String subjectId;
        private String title;
        private String description;
        private BigDecimal price;
        private String fieldId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private String subjectId;
        private String title;
        private String description;
        private String status;
        private BigDecimal price;
        private String tutorName;
        private String subjectName;
    }
}
