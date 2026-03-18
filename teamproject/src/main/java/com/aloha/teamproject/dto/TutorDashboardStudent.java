package com.aloha.teamproject.dto;

import java.util.List;

import lombok.Data;

@Data
public class TutorDashboardStudent {
    private String id;
    private String name;
    private String email;
    private String phone;
    private List<String> subjects;
    private Integer totalSessions;
    private String lastSession;
    private String progress;
    private String notes;
}
