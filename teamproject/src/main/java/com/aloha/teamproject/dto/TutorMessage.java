package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TutorMessage {
    private String id;
    private String bookingId;
    private String tutorId;
    private String tutorName;
    private String subject;
    private String studentName;
    private String studentId;
    private String senderRole;
    private String content;
    private LocalDateTime createdAt;
}
