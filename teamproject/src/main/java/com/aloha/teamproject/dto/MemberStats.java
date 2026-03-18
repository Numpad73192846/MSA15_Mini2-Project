package com.aloha.teamproject.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class MemberStats {
	
	private Integer upcomingLessons;
	private Integer completedLessons;
	private Integer totalReviews;
	private BigDecimal totalSpent;

}
