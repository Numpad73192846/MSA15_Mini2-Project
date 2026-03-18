package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TutorStudentNote {
    private String id;
    private String tutorId;
    private String studentId;
    private String progress;
    private String notes;
    private LocalDateTime updatedAt;
}
