package com.aloha.teamproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
	
	@Builder.Default
	private String id = UUID.randomUUID().toString();
	private String bookingId;
	private String studentId;
	private Integer rating;
	private String content;
	private String studentName;
	private LocalDateTime createdAt;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Request {
		private String bookingId;
		private Integer rating;
		private String content;
	}

}
