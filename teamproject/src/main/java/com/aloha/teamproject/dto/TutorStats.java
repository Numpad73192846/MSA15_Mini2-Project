package com.aloha.teamproject.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class TutorStats {
	
	private Integer totalLessons;
	private BigDecimal totalEarnings;
	private Integer activeStudents;
	private BigDecimal hourlyRate;
	private BigDecimal ratingAvg;
	private Integer reviewCount;

}
