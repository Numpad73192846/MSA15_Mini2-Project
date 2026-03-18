package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminInquiry {
    private Long no;
    private String id;
    private String userId;
    private String userName;
    private String userNickname;
    private String category;
    private String title;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String status;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
}
