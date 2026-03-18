package com.aloha.teamproject.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class MonthlyEarning {
	
	private String yearMonth;
	private Integer lessonCount;
	private BigDecimal totalHours;
	private BigDecimal totalEarnings;
	private Integer paidCount;
	private BigDecimal avgLessonPrice;

}
