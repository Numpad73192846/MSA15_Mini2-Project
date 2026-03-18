package com.aloha.teamproject.dto;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TutorAvailability {

    @JsonIgnore
    private Long no;
    @JsonIgnore
    private String userId;
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;
    @Builder.Default
    private Status status = Status.OPEN;
    @JsonIgnore
    private Date createdAt;
    @JsonIgnore
    private Date updatedAt;

    public TutorAvailability() {
        this.id = UUID.randomUUID().toString();
        this.status = Status.OPEN;
    }

    public enum Status {
        OPEN, BOOKED, CANCELLED
    }
}
