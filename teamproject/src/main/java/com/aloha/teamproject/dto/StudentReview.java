package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class StudentReview {
	
	private String reviewId;
	private String tutorId;
	private String tutorProfileId;
	private String tutorName;
	private Integer rating;
	private String content;
	private LocalDateTime createdAt;

}
