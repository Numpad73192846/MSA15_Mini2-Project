package com.aloha.teamproject.dto;

import java.time.LocalTime;
import java.util.Date;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TutorTimeRange {

    @JsonIgnore
    private Long no;
    @JsonIgnore
    private String userId;
    @Builder.Default
    private String id = UUID.randomUUID().toString();
    @JsonProperty("startTime")
    @JsonAlias({"startAt"})
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startAt;
    @JsonProperty("endTime")
    @JsonAlias({"endAt"})
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endAt;
    private DayOfWeek dayOfWeek;
    @JsonIgnore
    private Date createdAt;
    @JsonIgnore
    private Date updatedAt;

    public TutorTimeRange() {
        this.id = UUID.randomUUID().toString();
    }

    public enum DayOfWeek {
        MON, TUE, WED, THU, FRI, SAT, SUN
    }
}
