package com.aloha.teamproject.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class StudentBooking {
	
	private String bookingId;
	private String lessonId;
	private String tutorId;
	private String tutorProfileId;
	private String tutorName;
	private String subject;
	private LocalDateTime startAt;
	private LocalDateTime endAt;
	private String status;
	private BigDecimal price;
	private LocalDateTime paidAt;
	private String zoomJoinUrl;
	private String reviewId;
	
	// 뷰에서 사용할 편의 필드
	public String getLessonDate() {
		if (startAt == null) return "";
		return startAt.toLocalDate().toString();
	}
	
	public String getStartTime() {
		if (startAt == null) return "";
		return String.format("%02d:%02d", startAt.getHour(), startAt.getMinute());
	}
	
	public double getDurationHours() {
		if (startAt == null || endAt == null) return 0;
		long minutes = java.time.temporal.ChronoUnit.MINUTES.between(startAt, endAt);
		return minutes / 60.0;
	}

}
