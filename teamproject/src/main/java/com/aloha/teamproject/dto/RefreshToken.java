package com.aloha.teamproject.dto;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RefreshToken {
    
    private Long no;
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String userId;
    private String tokenHash;
    private Date expiresAt;
    private Date revokedAt;
    private String userAgent;
    private String ip;
    private Date createdAt;
    private Date updatedAt;

    public RefreshToken() {
        this.id = UUID.randomUUID().toString();
    }


}
