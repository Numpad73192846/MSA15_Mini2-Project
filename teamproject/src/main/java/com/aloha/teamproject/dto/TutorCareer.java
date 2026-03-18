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
public class TutorCareer {
    
    private String id;
    private String userId;
    private String companyName;
    private String jobCategory;
    private String jobRole;
    private Integer startYear;
    private Integer endYear;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private List<CareerItem> careers;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class CareerItem {
            private String companyName;
            private String jobCategory;
            private String jobRole;
            private Integer startYear;
            private Integer endYear;
        }
    }
}
