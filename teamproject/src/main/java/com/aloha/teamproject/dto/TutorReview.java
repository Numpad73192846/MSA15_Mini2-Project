package com.aloha.teamproject.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TutorReview {
	
	private String reviewId;
	private String bookingId;
	private String studentId;
	private String studentName;
	private Integer rating;
	private String content;
	private LocalDateTime createdAt;

}
