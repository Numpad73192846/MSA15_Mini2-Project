package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    private String id;
    private String userId;
    private String lessonId;
    private String availabilityId;
    private String title;
    private LocalDateTime requestedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime canceledAt;
    private LocalDateTime doneAt;
    private String memo;
    private String zoomJoinUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String lessonId;
        private String availabilityId;
        private String title;
        private String memo;
        private String zoomJoinUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private String lessonId;
        private String availabilityId;
        private String title;
        private LocalDateTime requestedAt;
        private LocalDateTime confirmedAt;
        private LocalDateTime canceledAt;
        private LocalDateTime doneAt;
        private String memo;
        private String zoomJoinUrl;
        private String status;
        private String tutorName;
        private String studentName;
    }
}
