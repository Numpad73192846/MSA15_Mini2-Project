package com.aloha.teamproject.dto;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LanguageField {

    private Long no;
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    private String name;
    private String category;
    private int seq;
    private Date createdAt;
    private Date updatedAt;

    public LanguageField() {
        this.id = UUID.randomUUID().toString();
    }
}
