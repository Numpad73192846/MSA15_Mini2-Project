package com.aloha.teamproject.dto;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorDocument {
    private Long no;
    private String userId;
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String docType; // 'EDUCATION', 'DEGREE', 'CERTIFICATE'
    private int fileSize;
    private String reviewedBy;
    private Date reviewedAt;
    private String rejectReason;
    private String originalName;
    private String storeName;
    private String filePath;
    private String contentType;
    private Date createdAt;
    private Date updatedAt;
    
    // For joining with users
    private String userName;
    private String userNickname;
    private String status;
}
