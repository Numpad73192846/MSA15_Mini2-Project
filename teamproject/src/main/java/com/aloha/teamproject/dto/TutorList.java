package com.aloha.teamproject.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TutorList {
    
    private String id;
    private String userId;
    private String name;
    private String nickname;
    private String bio;
    private String selfIntro;
    private BigDecimal ratingAvg;
    private Integer reviewCount;
    private String profileImg;
    private String videoUrl;
    private String subjects;
    private BigDecimal price;
    private String experience;
    private String careerTimeline;
    private String educationSchools;
    private String educationDegrees;
    private String educationTimeline;
    private String educationDocuments;
    private String degreeDocuments;
    private String certificates;

}
