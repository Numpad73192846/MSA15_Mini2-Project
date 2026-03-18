package com.aloha.teamproject.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorEducation {
    
    private String id;
    private String userId;
    private String schoolName;
    private String degree;
    private Integer startYear;
    private Integer graduatedYear;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private List<EducationItem> educations;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class EducationItem {
            private String schoolName;
            private String degree;
            private Integer startYear;
            private Integer graduatedYear;
        }
    }
}
