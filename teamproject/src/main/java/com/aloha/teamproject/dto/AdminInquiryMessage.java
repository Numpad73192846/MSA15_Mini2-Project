package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminInquiryMessage {
    private Long no;
    private String id;
    private String inquiryId;
    private String senderId;
    private String senderRole;
    private String senderName;
    private String content;
    private LocalDateTime createdAt;
}
